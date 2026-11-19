import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess?: () => void; // Add this prop
}

export const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess }: PaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Add your payment API call here
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      onPaymentSuccess?.(); // Call this after successful payment
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* MTN MoMo Logo */}
          <div className="flex justify-center">
            <img 
              src="https://mma.prnewswire.com/media/1688009/MTN_Mobile_Money.jpg?p=facebook" 
              alt="MTN Mobile Money" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Amount Display */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">{amount.toLocaleString()} RWF</p>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">MTN Mobile Money Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="078XXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Enter your MTN Mobile Money number to proceed
            </p>
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment} 
            disabled={!phoneNumber || phoneNumber.length < 10 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing && <Loader2 className="animate-spin" />}
            {isProcessing ? 'Processing Payment...' : 'Proceed to Pay'}
          </Button>

          {/* Info Text */}
          <p className="text-xs text-center text-muted-foreground">
            You will receive a prompt on your phone to confirm the payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};