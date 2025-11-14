"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: false,
        darkMode: false,
        twoFactor: false,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Manage your application preferences
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Receive push notifications on your device
                                </p>
                            </div>
                            <Switch
                                checked={settings.notifications}
                                onCheckedChange={() => handleToggle("notifications")}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Alerts</Label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Receive notifications via email
                                </p>
                            </div>
                            <Switch
                                checked={settings.emailAlerts}
                                onCheckedChange={() => handleToggle("emailAlerts")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            <Switch
                                checked={settings.twoFactor}
                                onCheckedChange={() => handleToggle("twoFactor")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize how PeopleCore looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Dark Mode</Label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Switch between light and dark theme
                                </p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onCheckedChange={() => handleToggle("darkMode")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full">Save All Settings</Button>
            </div>
        </div>
    );
}
