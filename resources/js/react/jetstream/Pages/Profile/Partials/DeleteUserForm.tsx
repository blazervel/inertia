import { useForm } from '@pckg/@inertiajs/inertia-react';
import { mergeCssClasses as classNames } from '@blazervel-ui/utils';
import React, { useRef, useState } from '@pckg/preact/compat';

import ActionSection from '@ja-inertia/react/jetstream/components/ActionSection';
import PrimaryButton from '@ja-inertia/react/jetstream/components/PrimaryButton';
import DialogModal from '@ja-inertia/react/jetstream/components/DialogModal';
import TextInput from '@ja-inertia/react/jetstream/components/TextInput';
import InputError from '@ja-inertia/react/jetstream/components/InputError';
import SecondaryButton from '@ja-inertia/react/jetstream/components/SecondaryButton';

export default function DeleteUserForm() {
  //const route = useRoute();
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const form = useForm({
    password: '',
  });
  const passwordRef = useRef<HTMLInputElement>(null);

  function confirmUserDeletion() {
    setConfirmingUserDeletion(true);

    setTimeout(() => passwordRef.current?.focus(), 250);
  }

  function deleteUser() {
    form.delete(route('current-user.destroy'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordRef.current?.focus(),
      onFinish: () => form.reset(),
    });
  }

  function closeModal() {
    setConfirmingUserDeletion(false);
    form.reset();
  }

  return (
    <ActionSection
      title={'Delete Account'}
      description={'Permanently delete your account.'}
    >
      <div className="max-w-xl text-sm text-gray-600">
        Once your account is deleted, all of its resources and data will be
        permanently deleted. Before deleting your account, please download any
        data or information that you wish to retain.
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={confirmUserDeletion}>
          Delete Account
        </PrimaryButton>
      </div>

      <DialogModal isOpen={confirmingUserDeletion} onClose={closeModal}>
        <DialogModal.Content title={'Delete Account'}>
          Are you sure you want to delete your account? Once your account is
          deleted, all of its resources and data will be permanently deleted.
          Please enter your password to confirm you would like to permanently
          delete your account.
          <div className="mt-4">
            <TextInput
              type="password"
              className="mt-1 block w-3/4"
              placeholder="Password"
              value={form.data.password}
              onChange={e => form.setData('password', e.currentTarget.value)}
            />

            <InputError message={form.errors.password} className="mt-2" />
          </div>
        </DialogModal.Content>
        <DialogModal.Footer>
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

          <PrimaryButton
            onClick={deleteUser}
            className={classNames('ml-2', { 'opacity-25': form.processing })}
            disabled={form.processing}
          >
            Delete Account
          </PrimaryButton>
        </DialogModal.Footer>
      </DialogModal>
    </ActionSection>
  );
}
