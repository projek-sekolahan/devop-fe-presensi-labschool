import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";

export default function ChangeModal({ mail, open }) {
	const [openModal, setOpenModal] = useState(open);
	const [email, setEmail] = useState("");

	function onCloseModal() {
		setOpenModal(false);
	}

	console.log(mail);

	return (
		<>
			{/* <Button onClick={() => setOpenModal(true)}>Toggle modal</Button> */}
			<Modal show={openModal} size="md" onClose={onCloseModal} popup>
				<Modal.Header />
				<Modal.Body>
					<div className="space-y-4">
						<div>
							<div className="mb-2 block">
								<Label htmlFor="email" value="Your email" />
							</div>
							<TextInput
								id="email"
								placeholder="name@company.com"
								value={email}
								onChange={(event) =>
									setEmail(event.target.value)
								}
								required
							/>
						</div>
						<div className="flex justify-end gap-2 ">
							<Button size="sm" outline color="failure">
								Cancel
							</Button>
							<Button size="sm" outline color="success">
								Save
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
