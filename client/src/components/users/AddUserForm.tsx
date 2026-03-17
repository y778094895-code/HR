import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Shield, User, Send, CheckCircle2 } from 'lucide-react';

export default function AddUserForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        role: 'employee',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({ username: '', email: '', fullName: '', role: 'employee' });
            setTimeout(() => setIsSuccess(false), 3000);
        }, 1500);
    };

    return (
        <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/70 border-primary/20 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <CardHeader className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Add New System User
                </CardTitle>
                <CardDescription>
                    Create a new administrative or employee account for the Smart HR platform.
                </CardDescription>
            </CardHeader>

            <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Full Name
                            </label>
                            <Input
                                placeholder="e.g. Saeed Mohammed"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="bg-white/50 border-primary/10 focus:border-primary focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Username
                            </label>
                            <Input
                                placeholder="s.mohammed"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="bg-white/50 border-primary/10 focus:border-primary focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Email Address
                        </label>
                        <Input
                            type="email"
                            placeholder="saeed@smart-hr.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white/50 border-primary/10 focus:border-primary focus:ring-primary/20 transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Access Level / Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-primary/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="employee">Employee</option>
                            <option value="hr_manager">HR Manager</option>
                            <option value="admin">System Administrator</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full relative overflow-hidden h-12 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating Account...
                            </div>
                        ) : isSuccess ? (
                            <div className="flex items-center gap-2 text-white animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                                User Created Successfully!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Create User
                            </div>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
