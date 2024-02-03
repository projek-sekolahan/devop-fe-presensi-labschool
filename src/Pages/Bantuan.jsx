import { Link } from "react-router-dom";
import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Accordion } from "flowbite-react";

export default function Bantuan() {
	const faqs = [
		{
			head: "Lorem ipsum dolor sit amet.",
			desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid dignissimos doloremque deserunt nisi, nesciunt placeat recusandae sit nemo, enim veniam explicabo quaerat autem ipsam dolor. Distinctio accusantium labore soluta ex.",
		},
		{
			head: "Lorem ipsum dolor sit amet, consectetur",
			desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid dignissimos doloremque deserunt nisi, nesciunt placeat recusandae sit nemo, enim veniam explicabo quaerat autem ipsam dolor. Distinctio accusantium labore",
		},
	];
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
			<header className="h-[60px] min-h-[60px] bg-primary-md p-4 pl-6 flex">
				<Link to="/home">
					<ArrowLeftIcon className="size-7 absolute" />
				</Link>

				<h2 className="text-lg font-bold mx-auto">Bantuan</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 pt-5 pb-4 text-black flex flex-col gap-4 overflow-y-auto bg-white">
				<h2 className="mx-auto font-bold text-3xl mb-4">FAQ</h2>
				<Accordion className="rounded-none">
					{faqs.map((faq, index) => {
						return(
							<Accordion.Panel key={index} >
								<Accordion.Title className="focus:ring-0">
									{faq.head}
								</Accordion.Title>
								<Accordion.Content>
									{faq.desc}
								</Accordion.Content>
							</Accordion.Panel>
						)
					})}
				</Accordion>
			</main>
		</div>
	);
}
