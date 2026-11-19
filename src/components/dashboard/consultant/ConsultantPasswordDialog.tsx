import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import * as Yup from 'yup';
import CustomInput from '@/components/custom/CustomInput';
import CustomButton from '@/components/custom/CustomButton';
import CustomErrorIndicator from '@/components/custom/CustomErrorIndicator';
import { Consultant } from '@/types/consultant/Consultant';
import { setPasswordForUser } from '@/services/authService';

interface ConsultantPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: Consultant;
}

/**
 * Pose un mot de passe sur un compte consultant (ex. compte de démo) : il se
 * connectera avec son e-mail et ce mot de passe, sans code.
 */
const ConsultantPasswordDialog = ({
  isOpen,
  onClose,
  consultant,
}: ConsultantPasswordDialogProps) => {
  const [isPending, setIsPending] = useState(false);

  const formik = useFormik({
    initialValues: { password: '', confirmation: '' },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(12, 'Au moins 12 caractères')
        .required('Le mot de passe est requis'),
      confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Les deux saisies sont différentes')
        .required('Confirmez le mot de passe'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsPending(true);
      try {
        await setPasswordForUser(consultant.id, values.password);
        toast.success('Mot de passe enregistré', {
          description: `${consultant.email} se connecte maintenant sans code.`,
          position: 'bottom-right',
          className: '!bg-[#CBF5E5] !text-[#176448] !border !border-[#CBF5E5]',
          descriptionClassName: '!text-[#176448] !text-sm',
        });
        resetForm();
        onClose();
      } catch {
        toast.error("Le mot de passe n'a pas été enregistré", {
          description: 'Réessayez dans un instant.',
          position: 'bottom-right',
          className: '!bg-[#DF1C41] !text-white',
          descriptionClassName: '!text-white !text-xs',
        });
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-1 rounded-[1.25rem] px-2 max-h-[95vh] overflow-y-auto hidden-scrollbar">
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col gap-10 py-6 px-2">
          <DialogHeader>
            <DialogTitle>
              Mot de passe de {consultant.firstname} {consultant.lastname}
            </DialogTitle>
            <DialogDescription>
              {consultant.email} se connectera avec ce mot de passe, sans code
              par e-mail.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={consultant.email}
              readOnly
              hidden
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consultant-password">Mot de passe</Label>
              <CustomInput
                id="consultant-password"
                name="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                value={formik.values.password}
                onChange={formik.handleChange}
                leftIcon={<Lock className="text-[#868C98]" size={16} />}
              />
              {formik.submitCount > 0 && formik.errors.password && (
                <CustomErrorIndicator message={formik.errors.password} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consultant-confirmation">Encore une fois</Label>
              <CustomInput
                id="consultant-confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                value={formik.values.confirmation}
                onChange={formik.handleChange}
                leftIcon={<Lock className="text-[#868C98]" size={16} />}
              />
              {formik.submitCount > 0 && formik.errors.confirmation && (
                <CustomErrorIndicator message={formik.errors.confirmation} />
              )}
            </div>
            <DialogFooter className="sm:justify-start">
              <CustomButton
                className="w-full"
                type="submit"
                disabled={isPending}
                isLoading={isPending}
              >
                Enregistrer
              </CustomButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultantPasswordDialog;
