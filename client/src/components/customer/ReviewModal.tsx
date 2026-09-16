import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Order, OrderItem } from "../../types/Order";
import { submitReview } from "../../services/order.service";
import { getErrorMessage } from "../../utils/getErrorMessage";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Textarea from "../ui/Textarea";

interface ReviewModalProps {
    order: Order;
    onClose: () => void;
}

export default function ReviewModal({ order, onClose }: ReviewModalProps) {
    const itemsToReview = order.orderItems.filter((item) => !item.review);

    return (
        <Modal title="Rate Your Order" onClose={onClose} size="lg">
            <p className="mb-5 text-sm text-ink-500">
                Share feedback for each item in order #{order.id}. Comments are optional.
            </p>

            <div className="space-y-5">
                {itemsToReview.map((item) => (
                    <ReviewItemForm key={item.id} item={item} />
                ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-stone-100 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}

function ReviewItemForm({ item }: { item: OrderItem }) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [validationError, setValidationError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: () => submitReview({
            orderItemId: item.id,
            rating,
            comment: comment.trim() || undefined,
        }),
        onSuccess: async () => {
            setSubmitted(true);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
                queryClient.invalidateQueries({ queryKey: ["today-menu"] }),
                queryClient.invalidateQueries({ queryKey: ["food", item.dailyMenu.food.id] }),
                queryClient.invalidateQueries({ queryKey: ["food-reviews", item.dailyMenu.food.id] }),
            ]);
        },
    });

    function handleSubmit() {
        if (rating < 1) {
            setValidationError("Please select a rating from 1 to 5 stars.");
            return;
        }

        setValidationError("");
        mutation.mutate();
    }

    return (
        <section className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
            <h3 className="font-display text-lg font-semibold text-ink-900">
                {item.dailyMenu.food.name}
            </h3>
            <p className="mt-1 text-xs text-ink-500">Purchased: {item.quantity}×</p>

            {submitted ? (
                <p className="mt-4 text-sm font-medium text-emerald-700">
                    ✓ Review submitted
                </p>
            ) : (
                <>
                    <div className="mt-4">
                        <p className="mb-1.5 text-sm font-medium text-ink-800">Your rating</p>
                        <div className="flex gap-1" role="radiogroup" aria-label={`Rating for ${item.dailyMenu.food.name}`}>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === value}
                                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                    onClick={() => {
                                        setRating(value);
                                        setValidationError("");
                                    }}
                                    className={`text-3xl leading-none transition-colors ${value <= rating ? "text-orange-500" : "text-stone-300 hover:text-orange-300"}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <Textarea
                            label="Comment (optional)"
                            value={comment}
                            maxLength={500}
                            rows={3}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="Tell us what you enjoyed."
                        />
                    </div>

                    <Alert type="error" message={validationError || (mutation.error ? getErrorMessage(mutation.error, "Could not submit your review.") : "")} />

                    <div className="mt-4 flex justify-end">
                        <Button type="button" onClick={handleSubmit} isLoading={mutation.isPending}>
                            Submit Review
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
}
