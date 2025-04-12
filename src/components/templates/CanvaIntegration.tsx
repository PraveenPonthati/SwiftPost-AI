
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CanvaIntegration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Check if there's an API key saved in localStorage
  React.useEffect(() => {
    const savedClientId = localStorage.getItem('canva_client_id');
    if (savedClientId) {
      setIsConnected(true);
    }
  }, []);

  const handleConnect = () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "Missing credentials",
        description: "Please enter both Client ID and Client Secret.",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, we would use these credentials to authenticate with Canva API
    // For this demo, we'll just save them to localStorage
    localStorage.setItem('canva_client_id', clientId);
    localStorage.setItem('canva_client_secret', clientSecret);
    
    setIsConnected(true);
    setIsDialogOpen(false);
    
    toast({
      title: "Connected to Canva",
      description: "Your Canva account has been successfully connected."
    });
  };

  const handleDisconnect = () => {
    localStorage.removeItem('canva_client_id');
    localStorage.removeItem('canva_client_secret');
    setIsConnected(false);
    setClientId('');
    setClientSecret('');
    
    toast({
      title: "Disconnected from Canva",
      description: "Your Canva account has been disconnected."
    });
  };

  return (
    <>
      <Button 
        variant={isConnected ? "default" : "outline"} 
        onClick={() => isConnected ? handleDisconnect() : setIsDialogOpen(true)}
      >
        {isConnected ? "Disconnect Canva" : "Connect Canva"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Canva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Canva Client ID</Label>
              <Input 
                id="client-id" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Canva Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-secret">Canva Client Secret</Label>
              <Input 
                id="client-secret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter your Canva Client Secret"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Find your Canva API credentials in your Canva Developer Console.</p>
              <p className="mt-1">
                <a 
                  href="https://www.canva.dev/docs/connect/quickstart/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Learn more about Canva Connect API
                </a>
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleConnect}>Connect</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CanvaIntegration;
