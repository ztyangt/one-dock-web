import { ref, onUnmounted, type Ref } from 'vue'

export const useCanvasRecorder = (canvas: Ref<HTMLCanvasElement | undefined>, name?: string) => {
  const isRecording = ref(false)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordedChunks = ref<Blob[]>([])

  const startRecording = () => {
    if (!canvas?.value) {
      console.error('Canvas not found')
      return
    }

    // 获取 MediaStream
    const stream = canvas.value.captureStream(30)
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: 8000000,
    })

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${name || 'recording'}.webm`
      a.click()
      URL.revokeObjectURL(url)

      recordedChunks.value = []
    }

    mediaRecorder.value.start()
    isRecording.value = true
  }

  const stopRecording = () => {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop()
      isRecording.value = false
    }
  }

  onUnmounted(() => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
    }
  })

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}
