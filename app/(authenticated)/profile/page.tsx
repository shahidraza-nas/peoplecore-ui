"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { User, Camera, Lock, Bell, Loader2, Eye, EyeOff, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { user, loading, updateProfile, changePassword, uploadAvatar } = useProfile();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showPasswordChangedDialog, setShowPasswordChangedDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        phone_code: '+1',
        phone: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        password: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        enable_2fa: false,
        send_email: true,
        send_sms: false,
        send_push: true,
    });
    useEffect(() => {
        if (user) {
            setProfileForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_code: user.phone_code || '+1',
                phone: user.phone || '',
            });
            setNotificationSettings({
                enable_2fa: user.enable_2fa || false,
                send_email: user.send_email !== false,
                send_sms: user.send_sms !== false,
                send_push: user.send_push !== false,
            });
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm({ ...profileForm, [e.target.id]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.id]: e.target.value });
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile(profileForm);
        setIsEditing(false);
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await changePassword(passwordForm);
            setPasswordForm({ old_password: '', password: '' });
            setShowPasswordChangedDialog(true);
        } catch (error) {
        }
    };

    const handleLoginNow = async () => {
        await logout();
        router.push('/login');
    };

    const handleLoginLater = () => {
        setShowPasswordChangedDialog(false);
    };

    const handleNotificationSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile(notificationSettings);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            await uploadAvatar(file);
        }
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    };

    const getAvatarUrl = () => {
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=200&background=random`;
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-zinc-500">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Manage your account information and preferences
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Avatar Section */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={getAvatarUrl()} />
                                    <AvatarFallback>{getInitials()}</AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={handleAvatarClick}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-zinc-500">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                    {user.enable_2fa && (
                                        <Badge variant="outline">2FA Enabled</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === 'profile'
                                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === 'security'
                                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                            activeTab === 'notifications'
                                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Bell className="w-4 h-4" />
                        Notifications
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSave} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            value={profileForm.first_name}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing || loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            value={profileForm.last_name}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing || loading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Read-only)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="bg-zinc-50 dark:bg-zinc-900"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_code">Code</Label>
                                        <Input
                                            id="phone_code"
                                            type="text"
                                            value={profileForm.phone_code}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing || loading}
                                            placeholder="+1"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing || loading}
                                            placeholder="1234567890"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {!isEditing ? (
                                        <Button type="button" onClick={() => setIsEditing(true)} className="w-full">
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                disabled={loading}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={loading} className="flex-1">
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSave} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="old_password">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="old_password"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.old_password}
                                            onChange={handlePasswordChange}
                                            disabled={loading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.password}
                                            onChange={handlePasswordChange}
                                            disabled={loading}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500">Password must be at least 6 characters</p>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Manage how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleNotificationSave} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="enable_2fa" className="font-medium">Two-Factor Authentication</Label>
                                            <p className="text-sm text-zinc-500">Require OTP for login</p>
                                        </div>
                                        <Switch
                                            id="enable_2fa"
                                            checked={notificationSettings.enable_2fa}
                                            onCheckedChange={(checked) => 
                                                setNotificationSettings({ ...notificationSettings, enable_2fa: checked })
                                            }
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="send_email" className="font-medium">Email Notifications</Label>
                                            <p className="text-sm text-zinc-500">Receive updates via email</p>
                                        </div>
                                        <Switch
                                            id="send_email"
                                            checked={notificationSettings.send_email}
                                            onCheckedChange={(checked) => 
                                                setNotificationSettings({ ...notificationSettings, send_email: checked })
                                            }
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="send_sms" className="font-medium">SMS Notifications</Label>
                                            <p className="text-sm text-zinc-500">Receive updates via SMS</p>
                                        </div>
                                        <Switch
                                            id="send_sms"
                                            checked={notificationSettings.send_sms}
                                            onCheckedChange={(checked) => 
                                                setNotificationSettings({ ...notificationSettings, send_sms: checked })
                                            }
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="send_push" className="font-medium">Push Notifications</Label>
                                            <p className="text-sm text-zinc-500">Receive push notifications</p>
                                        </div>
                                        <Switch
                                            id="send_push"
                                            checked={notificationSettings.send_push}
                                            onCheckedChange={(checked) => 
                                                setNotificationSettings({ ...notificationSettings, send_push: checked })
                                            }
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Preferences'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Password Changed Dialog */}
            <AlertDialog open={showPasswordChangedDialog} onOpenChange={setShowPasswordChangedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <AlertDialogTitle>Password Changed Successfully</AlertDialogTitle>
                                <AlertDialogDescription className="text-left">
                                    Your password has been updated. For security reasons, we recommend logging in again with your new password.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleLoginLater}>
                            Continue Session
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLoginNow}
                            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Login Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
