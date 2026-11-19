import React from 'react';
import SetPasswordForm from '@/components/dashboard/password/SetPasswordForm';

const PasswordPage = () => {
  return (
    <div className="flex flex-col p-8 gap-10 h-full overflow-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mot de passe</h1>
        <p className="text-sm text-[#525866]">
          Une fois posé, vous vous connectez avec votre e-mail et ce mot de
          passe, sans code.
        </p>
      </div>
      <SetPasswordForm />
    </div>
  );
};

export default PasswordPage;
