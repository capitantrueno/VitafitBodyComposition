import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import scaleIcon from '../public/scale.png'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() { setIsMenuOpen(!isMenuOpen) };

    return (
        <>
            <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6">
                <Link href="/" passHref onClick={() => { toggleMenu() }}>
                    <div className="flex items-center flex-shrink-0 text-white mr-6">
                        <Image
                            src={scaleIcon}
                            alt="scale logo"
                            width="64px"
                            height="64px"
                            className="h-12 w-12 mr-2"
                        />
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
                </div>

            </nav>
        </>
    )
}