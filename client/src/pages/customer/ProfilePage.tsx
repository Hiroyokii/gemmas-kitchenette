import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "../../hooks/useAuth";
import { changeMyPassword, updateMyAvatar, updateMyProfile } from "../../services/auth.service";
import { getErrorMessage } from "../../utils/getErrorMessage";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ProfilePage({ embedded = false }: { embedded?: boolean }) {
    const { user, updateUser } = useAuth();
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [block, setBlock] = useState(user?.block ?? "");
    const [lot, setLot] = useState(user?.lot ?? "");
    const [street, setStreet] = useState(user?.street ?? "");
    const [landmark, setLandmark] = useState(user?.landmark ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [avatarMessage, setAvatarMessage] = useState("");

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const profileMutation = useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (updatedUser) => {
            updateUser(updatedUser);
            setProfileMessage("Your profile information has been saved.");
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changeMyPassword,
        onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Your password has been changed.");
        },
    });

    const avatarMutation = useMutation({
        mutationFn: updateMyAvatar,
        onSuccess: (updatedUser) => {
            updateUser(updatedUser);
            setAvatarFile(null);
            setAvatarPreview(null);
            setAvatarError("");
            setAvatarMessage("Your profile picture has been updated.");
        },
    });

    function submitProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProfileMessage("");
        profileMutation.mutate({
            firstName,
            lastName,
            block,
            lot,
            street,
            landmark: landmark.trim() || null,
        });
    }

    function submitPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPasswordMessage("");
        setPasswordError("");
        if (newPassword !== confirmPassword) {
            setPasswordError("The new passwords do not match.");
            return;
        }
        passwordMutation.mutate({ currentPassword, newPassword });
    }

    function chooseAvatar(file: File | undefined) {
        setAvatarMessage("");
        setAvatarError("");
        setAvatarFile(null);
        setAvatarPreview(null);
        if (!file) return;
        if (!IMAGE_TYPES.includes(file.type)) {
            setAvatarError("Choose a JPG, PNG, or WebP image.");
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setAvatarError("Choose an image smaller than 5 MB.");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

    return (
        <div className={embedded ? "space-y-4" : "mx-auto max-w-3xl space-y-6"}>
            {!embedded && <PageHeader title="My profile" description="Update your contact details, delivery address, password, and profile picture." />}

            <Card className="h-auto p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-ink-900">Profile picture</h2>
                <div className="mt-4 flex flex-wrap items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-2xl font-semibold text-amber-800">
                        {avatarPreview || user?.avatarUrl ? (
                            <img src={avatarPreview ?? user?.avatarUrl ?? ""} alt="Profile preview" className="h-full w-full object-cover" />
                        ) : initials}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="profile-avatar" className="block text-sm font-medium text-ink-800">Choose a new picture</label>
                        <input
                            id="profile-avatar"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => chooseAvatar(event.target.files?.[0])}
                            className="block max-w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:font-medium file:text-amber-900"
                        />
                        <p className="text-xs text-ink-500">JPG, PNG, or WebP · up to 5 MB</p>
                        <Button type="button" size="sm" disabled={!avatarFile} isLoading={avatarMutation.isPending} onClick={() => avatarFile && avatarMutation.mutate(avatarFile)}>
                            Save picture
                        </Button>
                    </div>
                </div>
                <div className="mt-3 space-y-2">
                    <Alert type="error" message={avatarError || (avatarMutation.error ? getErrorMessage(avatarMutation.error, "Could not update your profile picture.") : "")} />
                    <Alert type="success" message={avatarMessage} />
                </div>
            </Card>

            <Card className="h-auto p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-ink-900">Personal and delivery information</h2>
                <p className="mt-1 text-sm text-ink-500">Your saved address is used when you choose delivery at checkout.</p>
                <form onSubmit={submitProfile} className="mt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} minLength={2} maxLength={50} required />
                        <Input label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} minLength={2} maxLength={50} required />
                        <Input label="Block" value={block} onChange={(event) => setBlock(event.target.value)} maxLength={50} required />
                        <Input label="Lot" value={lot} onChange={(event) => setLot(event.target.value)} maxLength={50} required />
                    </div>
                    <Input label="Street" value={street} onChange={(event) => setStreet(event.target.value)} maxLength={100} required />
                    <Input label="Landmark (optional)" value={landmark} onChange={(event) => setLandmark(event.target.value)} maxLength={200} />
                    <Alert type="error" message={profileMutation.error ? getErrorMessage(profileMutation.error, "Could not save your profile.") : ""} />
                    <Alert type="success" message={profileMessage} />
                    <Button type="submit" isLoading={profileMutation.isPending}>Save profile</Button>
                </form>
            </Card>

            <Card className="h-auto p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-ink-900">Change password</h2>
                <p className="mt-1 text-sm text-ink-500">Enter your current password to set a new one. Your other signed-in sessions will be signed out.</p>
                <form onSubmit={submitPassword} className="mt-5 space-y-4">
                    <Input label="Current password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={100} required />
                        <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={100} required />
                    </div>
                    <Alert type="error" message={passwordMutation.error ? getErrorMessage(passwordMutation.error, "Could not change your password.") : passwordError} />
                    <Alert type="success" message={passwordMutation.isSuccess ? passwordMessage : ""} />
                    <Button type="submit" isLoading={passwordMutation.isPending}>Change password</Button>
                </form>
            </Card>
        </div>
    );
}
