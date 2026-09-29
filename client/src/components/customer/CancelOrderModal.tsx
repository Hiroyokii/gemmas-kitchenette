import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface CancelOrderModalProps {
    isLoading: boolean;
    errorMessage?: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function CancelOrderModal({
    isLoading,
    errorMessage,
    onCancel,
    onConfirm,
}: CancelOrderModalProps) {
    return (
        <Modal title="Cancel this order?" onClose={onCancel} size="sm">
            <p className="text-sm leading-6 text-ink-600">
                Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <Alert type="error" message={errorMessage} />
            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Keep order
                </Button>
                <Button type="button" variant="danger" isLoading={isLoading} onClick={onConfirm}>
                    Yes, cancel order
                </Button>
            </div>
        </Modal>
    );
}
