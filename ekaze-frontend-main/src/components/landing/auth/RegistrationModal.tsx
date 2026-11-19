import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkerRegistrationForm } from './registration/WorkerRegistrationForm';
import { CompanyRegistrationForm } from './registration/CompanyRegistrationForm';
import { EmployerRegistrationForm } from './registration/EmployerRegistrationForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'worker' | 'company' | 'employer';
}

export const RegistrationModal = ({ 
  isOpen, 
  onClose,
  defaultTab = 'worker'
}: RegistrationModalProps) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t("registration.modal.title")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("registration.modal.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label={t("registration.modal.close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="border-b border-border/50 px-6 bg-muted/20">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
              <TabsTrigger value="worker" className="text-sm">
                {t("registration.modal.tabs.worker")}
              </TabsTrigger>
              <TabsTrigger value="employer" className="text-sm">
                {t("registration.modal.tabs.employer")}
              </TabsTrigger>
              <TabsTrigger value="company" className="text-sm">
                {t("registration.modal.tabs.company")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Worker Registration Tab */}
            <TabsContent value="worker" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <WorkerRegistrationForm onSuccess={onClose} />
            </TabsContent>

            {/* Employer Registration Tab */}
            <TabsContent value="employer" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <EmployerRegistrationForm onSuccess={onClose} />
            </TabsContent>

            {/* Company Registration Tab */}
            <TabsContent value="company" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CompanyRegistrationForm onSuccess={onClose} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};