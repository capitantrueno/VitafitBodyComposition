import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import scaleIcon from '../public/weighing-scale-64.png'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() { setIsMenuOpen(!isMenuOpen) };

    return (
        <>
            <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6">
                <Link href="/" passHref onClick={() => { toggleMenu() }}>
                    <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 176a128 128 0 1 1 256 0 128 128 0 1 1 -256 0zM391.8 64C359.5 24.9 310.7 0 256 0S152.5 24.9 120.2 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-56.2 0zM296 224c0-10.6-4.1-20.2-10.9-27.4l33.6-78.3c3.5-8.1-.3-17.5-8.4-21s-17.5 .3-21 8.4L255.7 184c-22 .1-39.7 18-39.7 40c0 22.1 17.9 40 40 40s40-17.9 40-40z"/></svg>
                        <span className="font-semibold text-xl tracking-tight">Vitafit Body Composition</span>
                    </div>
                </Link>

                <div className="block lg:hidden">
                    <button className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white"
                        onClick={() => { toggleMenu() }}
                    >
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
                    </button>
                </div>
                <div className={`w-full  flex-grow lg:flex lg:items-center lg:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="text-sm lg:flex-grow">
                        {/* <Link href="/scale/xiaomi" passHref
                            onClick={() => { toggleMenu() }}
                            className='block mt-4 lg:inline-block lg:mt-0 text-blue-100 hover:text-white mr-4'>
                            Mi Scale Scanner
                        </Link> */}
                        <Link href="/sync/garmin" passHref
                            onClick={() => { toggleMenu() }}
                            className='block mt-4 lg:inline-block lg:mt-0 text-blue-100 hover:text-white mr-4'>
                            Garmin Connect form
                        </Link>
                        <Link href="/faq" passHref
                            onClick={() => { toggleMenu() }}
                            className='block mt-4 lg:inline-block lg:mt-0 text-blue-100 hover:text-white mr-4'>
                            FAQ
                        </Link>

                    </div>
                    {/* <div>
                        <a href="https://play.google.com/store/apps/details?id=com.lukaszswiderski.MiScaleExporter" target="_blank" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">Android Application</a>
                    </div> */}
                </div>

            </nav>
        </>
    )
}