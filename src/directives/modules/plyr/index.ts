import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import type { Directive } from 'vue'

const handleRender = (el: HTMLElement) => {
  el.querySelectorAll('video').forEach((item: HTMLVideoElement) => {
    // 先检查 <meta name="referrer" content="no-referrer"> 是否存在
    // 如果不存在则插入
    if (!document.querySelector('meta[name="referrer"]')) {
      document.head.insertAdjacentHTML('beforeend', '<meta name="referrer" content="no-referrer">')
    }

    new Plyr(item, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      loop: { active: false },
      autoplay: false, // 是否自动播放
      volume: 0.7, // 初始音量
      settings: ['captions', 'quality', 'speed', 'loop'],
      ratio: '16:9',
      invertTime: false,
      tooltips: { controls: true, seek: true },
      i18n: {
        restart: '重播',
        rewind: '后退 {seektime}s',
        play: '播放',
        pause: '暂停',
        fastForward: '快进 {seektime}s',
        seek: '跳转',
        seekLabel: '{currentTime} of {duration}',
        played: '播放结束',
        buffered: '缓冲',
        currentTime: '当前时间',
        duration: '时长',
        volume: '音量',
        mute: '静音',
        unmute: '取消静音',
        enableCaptions: '启用字幕',
        disableCaptions: '禁用字幕',
        download: '下载',
        enterFullscreen: '进入全屏',
        exitFullscreen: '退出全屏',
        frameTitle: '播放 {title}',
        captions: '字幕',
        settings: '设置',
        pip: '画中画',
        menuBack: '返回上级菜单',
        speed: '倍速',
        normal: '常规',
        quality: '质量',
        loop: '循环',
        start: '开始',
        end: '结束',
        all: '所有',
        reset: '充值',
        disabled: '禁止',
        enabled: '允许',
        advertisement: 'Ad',
        qualityBadge: {
          2160: '4K',
          1440: 'HD',
          1080: 'HD',
          720: 'HD',
          576: 'SD',
          480: 'SD'
        }
      }
    })
  })
}

/**
 * plyr视频播放器 v-plyr
 */
const plyr: Directive = {
  mounted(el: HTMLElement) {
    handleRender(el)
  },
  updated(el: HTMLElement) {
    handleRender(el)
  }
}

export default plyr
