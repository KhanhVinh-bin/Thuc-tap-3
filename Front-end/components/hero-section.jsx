"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import * as THREE from "three"

export default function HeroSection() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true, // để trong suốt, không che overlay
      })

      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      containerRef.current.appendChild(renderer.domElement)

      // Geometry + Shader
      const geometry = new THREE.PlaneGeometry(8, 5, 100, 100)
      const material = new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0.0 },
          u_color1: { value: new THREE.Color(0x6b5edb) },
          u_color2: { value: new THREE.Color(0x2e2a82) },
        },
        vertexShader: `
          uniform float u_time;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z = sin(pos.x * 2.0 + u_time * 2.0) * 0.25 
                   + cos(pos.y * 3.0 + u_time * 1.5) * 0.25;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float u_time;
          uniform vec3 u_color1;
          uniform vec3 u_color2;
          varying vec2 vUv;
          void main() {
            float wave = sin(vUv.x * 10.0 + u_time) * 0.1;
            vec3 color = mix(u_color1, u_color2, vUv.y + wave);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      })

      const plane = new THREE.Mesh(geometry, material)
      scene.add(plane)
      camera.position.z = 3

      const clock = new THREE.Clock()

      const animate = () => {
        requestAnimationFrame(animate)
        material.uniforms.u_time.value = clock.getElapsedTime()
        renderer.render(scene, camera)
      }

      animate()

      // Responsive
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        renderer.dispose()
        geometry.dispose()
        material.dispose()
        if (containerRef.current?.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }
      }
    } catch (error) {
      console.warn("WebGL init failed:", error)
    }
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden text-white">
      {/* Shader background */}
      <div ref={containerRef} className="absolute inset-0 z-0"></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
              Lộ trình
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Mỗi khóa học — Một bước tiến xa hơn
            </h1>

            <div className="text-lg lg:text-xl text-purple-100">
              <span className="block mb-2">EduLearn</span>
              <p className="leading-relaxed">
                Khám phá hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu.
                Nâng cao kỹ năng và thay đổi sự nghiệp của bạn ngay hôm nay!
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/courses"
                className="px-6 py-3 bg-[#fbbf24] text-white rounded-lg font-semibold hover:bg-[#f59e0b] transition-all hover:scale-105 hover:shadow-lg"
              >
                Khám phá khóa học
              </Link>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                <Play className="w-5 h-5" />
                Xem Video
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[300px] sm:w-[400px] md:w-[450px] lg:w-[500px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/team-1.jpg"
                alt="Learning illustration"
                className="w-full h-full object-cover object-center animate-floating"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
