import { useForm, Head } from '@pckg/@inertiajs/inertia-react';
import { mergeCssClasses as classNames } from '@blazervel-ui/utils';
import React from '@pckg/preact/compat';

import AuthenticationCard from '@ja-inertia/react/jetstream/components/AuthenticationCard';
import InputLabel from '@ja-inertia/react/jetstream/components/InputLabel';
import PrimaryButton from '@ja-inertia/react/jetstream/components/PrimaryButton';
import TextInput from '@ja-inertia/react/jetstream/components/TextInput';
import InputError from '@ja-inertia/react/jetstream/components/InputError';

interface Props {
  status: string;
}

export default function ForgotPassword({ status }: Props) {
  //const route = useRoute();
  const form = useForm({
    email: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('password.email'));
  }

  return (
    <AuthenticationCard>
      <Head title="Forgot Password" />

      <div className="mb-4 text-sm text-gray-600">
        Forgot your password? No problem. Just let us know your email address
        and we will email you a password reset link that will allow you to
        choose a new one.
      </div>

      {status && (
        <div className="mb-4 font-medium text-sm text-green-600">{status}</div>
      )}

      <form onSubmit={onSubmit}>
        <div>
          <InputLabel htmlFor="email">Email</InputLabel>
          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={form.data.email}
            onChange={e => form.setData('email', e.currentTarget.value)}
            required
            autoFocus
          />
          <InputError className="mt-2" message={form.errors.email} />
        </div>

        <div className="flex items-center justify-end mt-4">
          <PrimaryButton
            className={classNames({ 'opacity-25': form.processing })}
            disabled={form.processing}
          >
            Email Password Reset Link
          </PrimaryButton>
        </div>
      </form>
    </AuthenticationCard>
  );
}
