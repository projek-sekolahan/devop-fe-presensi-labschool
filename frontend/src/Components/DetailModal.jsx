import { Modal, Button } from "flowbite-react";
export default function DetailModal({ showModal, setShowModal, headerTitle, loading }) {
    return (
        <Modal dismissible size="md" position="center" show={showModal} onClose={() => setShowModal(false)} className="pt-20">
            <Modal.Header>{headerTitle}</Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer className="flex justify-end">
                <Button className="ml-auto" color="gray" onClick={() => setShowModal(false)}>{loading ? "Loading" : "Close"}</Button>
            </Modal.Footer>
        </Modal>
    );
}