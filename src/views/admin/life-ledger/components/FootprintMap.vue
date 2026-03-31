<template>
  <div class="footprint-map glass-panel">
    <div class="map-head">
      <div>
        <h3 class="map-title">{{ title }}</h3>
        <p class="map-desc">{{ description }}</p>
      </div>

      <div class="map-legend">
        <span class="legend-item">
          <i class="legend-dot active"></i>
          当前选中
        </span>
        <span class="legend-item">
          <i class="legend-dot visible"></i>
          可见足迹
        </span>
        <span class="legend-item">
          <i class="legend-dot hidden"></i>
          已隐藏足迹
        </span>
      </div>
    </div>

    <div ref="mapRef" class="map-body" :style="{ height }"></div>

    <div class="map-footer">
      <span>支持时间线联动高亮、地图点击取点、可见轨迹自动连线</span>
      <span v-if="selectedPoint">
        当前：{{ selectedPoint.title }} · {{ selectedPoint.address || `${selectedPoint.lat}, ${selectedPoint.lng}` }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

export interface FootprintMapPoint {
  id: string
  title: string
  date: string
  lat: number
  lng: number
  hidden?: boolean
  address?: string
}

const props = withDefaults(
  defineProps<{
    points: FootprintMapPoint[]
    selectedId?: string | null
    interactive?: boolean
    height?: string
    title?: string
    description?: string
  }>(),
  {
    selectedId: null,
    interactive: false,
    height: '420px',
    title: '足迹地图',
    description: '基于 Leaflet 展示打卡地点、时间线轨迹与隐藏状态',
  },
)

const emit = defineEmits<{
  (e: 'point-click', id: string): void
  (e: 'map-click', payload: { lat: number; lng: number }): void
}>()

const mapRef = ref<HTMLDivElement | null>(null)
const mapInstance = shallowRef<any>(null)
const leafletRef = shallowRef<any>(null)
const markerLayer = shallowRef<any>(null)
const polylineLayer = shallowRef<any>(null)

const selectedPoint = computed(
  () => props.points.find((item) => item.id === props.selectedId) || null,
)

const visiblePoints = computed(() => props.points.filter((item) => !item.hidden))

const focusPoint = (point: FootprintMapPoint | null, zoom = 11) => {
  if (!mapInstance.value || !point) return

  mapInstance.value.flyTo([point.lat, point.lng], zoom, {
    duration: 0.65,
  })
}

const clearLayers = () => {
  if (markerLayer.value) {
    markerLayer.value.clearLayers?.()
    markerLayer.value.remove?.()
    markerLayer.value = null
  }

  if (polylineLayer.value) {
    polylineLayer.value.remove?.()
    polylineLayer.value = null
  }
}

const buildMarkerStyle = (point: FootprintMapPoint) => {
  const isSelected = point.id === props.selectedId

  if (point.hidden) {
    return {
      radius: isSelected ? 11 : 8,
      color: '#94a3b8',
      fillColor: '#cbd5e1',
      fillOpacity: 0.72,
      weight: isSelected ? 3 : 2,
    }
  }

  if (isSelected) {
    return {
      radius: 12,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.95,
      weight: 4,
    }
  }

  return {
    radius: 9,
    color: '#0ea5e9',
    fillColor: '#7dd3fc',
    fillOpacity: 0.88,
    weight: 2,
  }
}

const renderMap = async () => {
  if (!leafletRef.value || !mapInstance.value) return

  const L = leafletRef.value
  clearLayers()

  markerLayer.value = L.layerGroup().addTo(mapInstance.value)

  props.points.forEach((point) => {
    const marker = L.circleMarker([point.lat, point.lng], buildMarkerStyle(point))
      .bindTooltip(
        `
          <div style="min-width: 160px;">
            <div style="font-weight:700;color:#0f172a;">${point.title}</div>
            <div style="margin-top:6px;color:#475569;font-size:12px;">${point.address || '未填写地点说明'}</div>
            <div style="margin-top:4px;color:#64748b;font-size:12px;">${new Date(point.date).toLocaleString('zh-CN')}</div>
          </div>
        `,
        {
          direction: 'top',
          offset: [0, -8],
          opacity: 0.95,
        },
      )
      .on('click', () => emit('point-click', point.id))

    marker.addTo(markerLayer.value)
  })

  if (visiblePoints.value.length > 1) {
    polylineLayer.value = L.polyline(
      visiblePoints.value.map((item) => [item.lat, item.lng]),
      {
        color: '#38bdf8',
        opacity: 0.75,
        weight: 3,
        dashArray: '8 8',
        lineCap: 'round',
      },
    ).addTo(mapInstance.value)
  }

  const sourcePoints = props.points.length ? props.points : visiblePoints.value
  if (sourcePoints.length) {
    const bounds = L.latLngBounds(sourcePoints.map((item) => [item.lat, item.lng]))
    mapInstance.value.fitBounds(bounds.pad(0.18))
  } else {
    mapInstance.value.setView([30.2741, 120.1551], 8)
  }

  if (selectedPoint.value) {
    focusPoint(selectedPoint.value, 12)
  }
}

onMounted(async () => {
  if (!mapRef.value) return

  const leafletModule = await import('leaflet')
  const L = leafletModule.default || leafletModule

  leafletRef.value = L
  mapInstance.value = L.map(mapRef.value, {
    zoomControl: true,
    attributionControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapInstance.value)

  if (props.interactive) {
    mapInstance.value.on('click', (event: any) => {
      emit('map-click', {
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      })
    })
  }

  await nextTick()
  await renderMap()

  window.setTimeout(() => {
    mapInstance.value?.invalidateSize?.()
  }, 120)
})

watch(
  () => props.points,
  async () => {
    await renderMap()
  },
  { deep: true },
)

watch(
  () => props.selectedId,
  async () => {
    await renderMap()
    if (selectedPoint.value) {
      focusPoint(selectedPoint.value, 12)
    }
  },
)

onBeforeUnmount(() => {
  clearLayers()
  mapInstance.value?.off?.()
  mapInstance.value?.remove?.()
  mapInstance.value = null
})
</script>

<style scoped lang="scss">
.footprint-map {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.map-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.map-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.map-desc {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.56);
  color: var(--color-pill-text);
  font-size: 12px;
  font-weight: 600;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.active {
  background: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
}

.legend-dot.visible {
  background: #7dd3fc;
}

.legend-dot.hidden {
  background: #cbd5e1;
}

.map-body {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.46);
  min-height: 280px;
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.7;
}

:deep(.leaflet-control-zoom),
:deep(.leaflet-bar) {
  border: 1px solid var(--color-border) !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1) !important;
}

:deep(.leaflet-control-zoom a) {
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  color: var(--color-text-main) !important;
  background: rgba(255, 255, 255, 0.92) !important;
}

:deep(.leaflet-control-attribution) {
  background: rgba(255, 255, 255, 0.72) !important;
  color: var(--color-text-muted) !important;
  border-radius: 10px 0 0 0;
  padding: 4px 8px !important;
}

:deep(.leaflet-tooltip) {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}

@media (max-width: 768px) {
  .footprint-map {
    padding: 14px;
  }

  .map-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
