'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  if (user?.role !== 'superadmin') {
    return (
        <Alert variant="destructive" className="max-w-md mx-auto">
            <Lock className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You do not have permission to view this page. This area is for Superadmins only.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-6">
        <h1 className="font-headline text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Subdomain Management</CardTitle>
          <CardDescription>
            Create and manage subdomains for registered villages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">New Subdomain</Label>
              <div className="flex items-center space-x-2">
                <Input id="subdomain" placeholder="e.g., majujaya" />
                <span className="text-muted-foreground">.desadataconnect.com</span>
              </div>
            </div>
            <Button>Create Subdomain</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
