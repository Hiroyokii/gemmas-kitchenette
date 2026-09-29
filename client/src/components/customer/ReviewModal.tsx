import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Order, OrderItem } from "../../types/Order";

import { submitReview } from "../../services/order.service";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../ui/Alert";

import Button from "../ui/Button";

import Modal from "../ui/Modal";

interface ReviewModalProps {
    order: Order;
    onClose: () => void;
}

export default function ReviewModal({
    order,
    onClose,
}: ReviewModalProps) {
    const itemsToReview = order.orderItems.filter(
        (item) => !item.review
    );

    const [ratings, setRatings] = useState<Record<number, number>>({});
    const [validationError, setValidationError] = useState("");

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            for (const item of itemsToReview) {
                await submitReview({
                    orderItemId: item.id,
                    rating: ratings[item.id],
                });
            }
        },

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["my-orders"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["order", order.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["today-menu"],
                }),
            ]);

            onClose();
        },
    });

    function handleRating(itemId: number, rating: number) {
        setRatings((previous) => ({
            ...previous,
            [itemId]: rating,
        }));

        setValidationError("");
    }

    function handleSubmit() {
        const hasMissingRating = itemsToReview.some(
            (item) => !ratings[item.id]
        );

        if (hasMissingRating) {
            setValidationError(
                "Please rate all items before submitting your review."
            );
            return;
        }

        setValidationError("");
        mutation.mutate();
    }

    return (
        <Modal
            title="Rate Your Order"
            onClose={onClose}
            size="lg"
        >
            <div className="space-y-6">
                {itemsToReview.map((item) => (
                    <ReviewItemForm
                        key={item.id}
                        item={item}
                        rating={ratings[item.id] ?? 0}
                        onRatingChange={handleRating}
                    />
                ))}
            </div>

            <Alert
                type="error"
                message={
                    validationError ||
                    (mutation.error
                        ? getErrorMessage(
                              mutation.error,
                              "Could not submit your review."
                          )
                        : "")
                }
            />

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-100 pt-5">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    isLoading={mutation.isPending}
                >
                    Submit Review
                </Button>
            </div>
        </Modal>
    );
}

function ReviewItemForm({
    item,
    rating,
    onRatingChange,
}: {
    item: OrderItem;
    rating: number;
    onRatingChange: (itemId: number, rating: number) => void;
}) {
    return (
        <section className="rounded-2xl border border-orange-100 bg-orange-50/40 px-6 py-7 text-center">
            <h3 className="font-display text-xl font-semibold text-ink-900 md:text-2xl">
                {item.dailyMenu.food.name}
            </h3>

            <p className="mt-1.5 text-sm text-ink-500">
                Purchased: {item.quantity}×
            </p>

            <div className="mt-6">
                <p className="mb-3 text-base font-medium text-ink-800">
                    How would you rate this item?
                </p>

                <div
                    className="flex justify-center gap-2"
                    role="radiogroup"
                    aria-label={`Rating for ${item.dailyMenu.food.name}`}
                >
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={rating === value}
                            aria-label={`${value} star${
                                value === 1 ? "" : "s"
                            }`}
                            onClick={() =>
                                onRatingChange(item.id, value)
                            }
                            className={`text-4xl leading-none transition-colors md:text-5xl ${
                                value <= rating
                                    ? "text-orange-500"
                                    : "text-stone-300 hover:text-orange-300"
                            }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}