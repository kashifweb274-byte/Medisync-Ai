import React from 'react'

export default function VideoShowcase({ videoSrc = "/assets/medisync-demo.mp4" }) {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 font-sans">
      <div className="relative flex justify-center items-center">
        
        {/* Floating Badges */}
        <div className="hidden sm:block absolute -left-6 top-[25%] z-20 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-[#74d2bd] to-[#ffa462]">
          Human / AI Assistant
        </div>

        <div className="hidden sm:block absolute -left-8 bottom-[20%] z-20 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-[#ffa462] to-[#65c3b0]">
          Tracking Medication
        </div>

        <div className="hidden sm:block absolute -right-6 top-[30%] z-20 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-[#ffa462] to-[#68c7b4]">
          Health Score
        </div>

        <div className="hidden sm:block absolute -right-8 bottom-[18%] z-20 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-[#6ecab7] to-[#52bfa9]">
          Achieving health goals
        </div>

        {/* Video Box */}
        <div className="w-full border-4 border-[#f38237] rounded-3xl overflow-hidden shadow-2xl bg-[#0b2b26] relative z-10">
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full h-auto object-cover max-h-[450px] block"
          >
            <source src={videoSrc} type="video/mp4" />
            {/* Fallback online sample video if local file doesn't exist */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patient-41581-large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

      </div>
    </div>
  )
}