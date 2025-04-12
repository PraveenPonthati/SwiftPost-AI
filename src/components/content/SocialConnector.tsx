
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Twitter } from 'lucide-react';
import { SocialPlatform } from '@/types/content';
import { connectAccount, disconnectAccount, getConnectedAccounts, getMetaApiFormat } from '@/utils/socialService';
import { useToast } from '@/components/ui/use-toast';

interface SocialConnectorProps {
  onAccountsUpdated?: () => void;
}

const SocialConnector: React.FC<SocialConnectorProps> = ({ onAccountsUpdated }) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState(getConnectedAccounts());
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showEnvFormat, setShowEnvFormat] = useState(false);
  
  const handleConnect = async () => {
    if (!connectingPlatform || !apiKey.trim()) return;
    
    setIsConnecting(true);
    try {
      const updated = await connectAccount(connectingPlatform, apiKey);
      setAccounts(getConnectedAccounts());
      setConnectingPlatform(null);
      setApiKey('');
      
      toast({
        title: "Account Connected",
        description: `Your ${connectingPlatform} account has been connected successfully.`
      });
      
      if (onAccountsUpdated) onAccountsUpdated();
    } catch (error) {
      console.error('Error connecting account:', error);
      toast({
        title: "Connection Failed",
        description: "There was an error connecting your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async (platform: SocialPlatform) => {
    try {
      await disconnectAccount(platform);
      setAccounts(getConnectedAccounts());
      
      toast({
        title: "Account Disconnected",
        description: `Your ${platform} account has been disconnected.`
      });
      
      if (onAccountsUpdated) onAccountsUpdated();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Disconnection Failed",
        description: "There was an error disconnecting your account. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    return <Twitter className="h-5 w-5" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
          <CardDescription>
            Connect your Twitter account to publish content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div 
                key={account.platform}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                    {account.profileImage ? (
                      <img 
                        src={account.profileImage} 
                        alt={account.platform} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-xl">{getPlatformIcon(account.platform)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{account.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.connected ? `@${account.username}` : 'Not connected'}
                    </div>
                  </div>
                </div>
                
                {account.connected ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect(account.platform)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConnectingPlatform(account.platform)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <Button 
            variant="link" 
            className="px-0" 
            onClick={() => setShowEnvFormat(true)}
          >
            View API Key Format
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={!!connectingPlatform} onOpenChange={(open) => !open && setConnectingPlatform(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {connectingPlatform}</DialogTitle>
            <DialogDescription>
              Enter your API key to connect your {connectingPlatform} account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                For demonstration purposes, any value will work. In a real application,
                you would need to authenticate using the platform's OAuth flow.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectingPlatform(null)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEnvFormat} onOpenChange={setShowEnvFormat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Format</DialogTitle>
            <DialogDescription>
              Add these environment variables to your .env file
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {getMetaApiFormat()}
            </pre>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowEnvFormat(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialConnector;
