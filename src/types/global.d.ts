declare module '*.glsl' {
  const content: string
  export default content
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $URL: (url?: string) => string
  }
}

export {}
