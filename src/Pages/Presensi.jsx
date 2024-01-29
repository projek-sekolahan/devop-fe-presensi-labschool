import {ArrowLeftIcon} from "@heroicons/react/24/outline"

export default function Presensi(){
    return(
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px) relative text-white">
            <header className="h-1/5 bg-primary-md relative p-6">
                <ArrowLeftIcon className="size-9 absolute top-10"/>
                <h2 className="text-4xl font-bold absolute bottom-5">Presensi</h2>
            </header>
            <main className="w-full h-4/5 relative bottom-0 left-0 px-8 pt-10 pb-4 text-primary-md">
                <div className="bg-white w-full rounded-xl p-4 flex flex-col gap-2">
                    <p>09:41 WIB</p>
                    <small>Tanggal : 23-02-2023</small>
                    <div className="grid grid-cols-2 gap-4 text-white">
                        <div className="w-full h-12 bg-secondary-green rounded-md">Masuk</div>
                    </div>
                </div>
            </main>
        </div>
    )
}