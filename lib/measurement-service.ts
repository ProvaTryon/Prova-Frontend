import type { Product, SizeMeasurementChartEntry } from '@/lib/product-service'

const runtimeEnv = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env

const API_URL = runtimeEnv?.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const UPPER_BODY_CATEGORIES = new Set([
  'shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'tshirts',
  'blouse', 'blouses', 'jacket', 'jackets', 'coat', 'coats',
  'sweater', 'sweaters', 'hoodie', 'hoodies', 'top', 'tops',
  'vest', 'vests', 'cardigan', 'cardigans', 'polo', 'polos',
  'blazer', 'blazers',
])

const LOWER_BODY_CATEGORIES = new Set([
  'pant', 'pants', 'trouser', 'trousers', 'jeans',
  'shorts', 'skirt', 'skirts', 'legging', 'leggings',
  'jogger', 'joggers',
])

interface MeasurementRecord {
  _id: string
  userId: string
  engine: 'mediapipe' | 'shapy'
  measurements: Record<string, unknown>
  size_recommendation?: {
    top?: string
    bottom?: string
    [key: string]: unknown
  }
  chest_circumference?: number
  waist?: number
  hip?: number
  shoulder_width?: number
  trouser_length?: number
  createdAt?: string
  updatedAt?: string
}

interface LatestMeasurementEnvelope {
  success: boolean
  message: string
  data: MeasurementRecord | null
}

interface RefreshPayload {
  height_cm?: number
  weight_kg?: number
  gender?: 'male' | 'female' | 'unisex'
  region?: 'EU' | 'US' | 'UK' | 'IT' | 'FR' | 'DE'
  fit?: 'regular' | 'slim' | 'oversized'
  engine?: 'mediapipe'
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      json.msg || json.message || `Request failed (${res.status})`,
    )
  }

  return json as T
}

export async function refreshMeasurementsFromProfile(
  payload: RefreshPayload = {},
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/api/measurements/refresh-from-profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return handleJson<Record<string, unknown>>(res)
}

export async function fetchLatestMeasurements(): Promise<MeasurementRecord | null> {
  const res = await fetch(`${API_URL}/api/measurements/me/latest`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (res.status === 404) {
    return null
  }

  const envelope = await handleJson<LatestMeasurementEnvelope>(res)
  return envelope.data ?? null
}

function normalizeCategoryTokens(category?: string): string[] {
  if (!category) return []

  return category
    .split(',')
    .flatMap((part) => part.split('/'))
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
}

function hasPair(min?: number, max?: number): boolean {
  return min !== undefined && max !== undefined
}

function inRange(value: number, min?: number, max?: number): boolean {
  if (min === undefined && max === undefined) return true
  if (min === undefined || max === undefined) return false
  return value >= min && value <= max
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function resolveAxis(product: Product): 'top' | 'bottom' | null {
  const tokens = normalizeCategoryTokens(product.category)
  if (tokens.some((token) => UPPER_BODY_CATEGORIES.has(token))) return 'top'
  if (tokens.some((token) => LOWER_BODY_CATEGORIES.has(token))) return 'bottom'
  return null
}

function normalizeSizeToken(size: string): string {
  return size
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
}

function toAlternateSizeToken(token: string): string | null {
  const xlCountMatch = token.match(/^(X+)L$/)
  if (xlCountMatch) {
    const count = xlCountMatch[1].length
    if (count >= 2) {
      return `${count}XL`
    }
  }

  const numericXlMatch = token.match(/^(\d)XL$/)
  if (numericXlMatch) {
    const count = Number(numericXlMatch[1])
    if (count >= 2 && count <= 9) {
      return `${'X'.repeat(count)}L`
    }
  }

  return null
}

function findAvailableSizeMatch(
  sizes: string[],
  candidate: string | null | undefined,
): string | null {
  if (!candidate) return null

  const normalizedToOriginal = new Map<string, string>()
  for (const size of sizes) {
    const normalized = normalizeSizeToken(size)
    if (normalized && !normalizedToOriginal.has(normalized)) {
      normalizedToOriginal.set(normalized, size)
    }
  }

  const normalizedCandidate = normalizeSizeToken(candidate)
  const directMatch = normalizedToOriginal.get(normalizedCandidate)
  if (directMatch) {
    return directMatch
  }

  const alternateToken = toAlternateSizeToken(normalizedCandidate)
  if (!alternateToken) {
    return null
  }

  return normalizedToOriginal.get(alternateToken) ?? null
}

function findMatchingSizeByChart(
  chart: SizeMeasurementChartEntry[],
  sizes: string[],
  axis: 'top' | 'bottom',
  measurement: MeasurementRecord,
): string | null {
  const measurements = measurement.measurements || {}
  const chest = toNumber(measurement.chest_circumference) ?? toNumber(measurements.chest_circumference)
  const waist = toNumber(measurement.waist) ?? toNumber(measurements.waist)
  const hip = toNumber(measurement.hip) ?? toNumber(measurements.hip)
  const shoulder = toNumber(measurement.shoulder_width) ?? toNumber(measurements.shoulder_width)
  const inseam = toNumber(measurement.trouser_length) ?? toNumber(measurements.trouser_length)

  const chartMap = new Map(chart.map((entry) => [entry.size.trim().toUpperCase(), entry]))

  for (const size of sizes) {
    const entry = chartMap.get(size.trim().toUpperCase())
    if (!entry) continue

    if (axis === 'top') {
      if (!hasPair(entry.chestMin, entry.chestMax) || chest === undefined) continue
      const checks = [inRange(chest, entry.chestMin, entry.chestMax)]
      if (hasPair(entry.waistMin, entry.waistMax) && waist !== undefined) {
        checks.push(inRange(waist, entry.waistMin, entry.waistMax))
      }
      if (hasPair(entry.shoulderMin, entry.shoulderMax) && shoulder !== undefined) {
        checks.push(inRange(shoulder, entry.shoulderMin, entry.shoulderMax))
      }
      if (checks.every(Boolean)) return size
      continue
    }

    const hasWaistRange = hasPair(entry.waistMin, entry.waistMax)
    const hasHipRange = hasPair(entry.hipMin, entry.hipMax)
    if (!hasWaistRange && !hasHipRange) continue

    const checks: boolean[] = []
    if (hasWaistRange) {
      if (waist === undefined) continue
      checks.push(inRange(waist, entry.waistMin, entry.waistMax))
    }
    if (hasHipRange) {
      if (hip === undefined) continue
      checks.push(inRange(hip, entry.hipMin, entry.hipMax))
    }
    if (hasPair(entry.inseamMin, entry.inseamMax) && inseam !== undefined) {
      checks.push(inRange(inseam, entry.inseamMin, entry.inseamMax))
    }

    if (checks.every(Boolean)) return size
  }

  return null
}

export function getRecommendedSizeForProduct(
  product: Product,
  measurement: MeasurementRecord | null,
): string | null {
  if (!measurement) return null

  const sizes = (product.sizes || [])
    .filter((size): size is string => typeof size === 'string')
    .map((size) => size.trim())
    .filter(Boolean)

  if (sizes.length === 0) return null

  if (product.matchedSize) {
    return findAvailableSizeMatch(sizes, product.matchedSize)
  }

  const axis = resolveAxis(product)
  if (!axis) return null

  const chart = product.sizeMeasurementChart || []

  if (chart.length > 0 && sizes.length > 0) {
    const matched = findMatchingSizeByChart(chart, sizes, axis, measurement)
    if (matched) return findAvailableSizeMatch(sizes, matched)
  }

  // Fallback to AI size recommendation only if it exists in available product sizes.
  const fallback =
    axis === 'top'
      ? measurement.size_recommendation?.top
      : measurement.size_recommendation?.bottom

  return findAvailableSizeMatch(sizes, fallback)
}
