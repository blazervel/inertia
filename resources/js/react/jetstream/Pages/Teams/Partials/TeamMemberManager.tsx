
import { useTypedPage } from '@ja-inertia//utils';
import ActionMessage from '@ja-inertia/react/jetstream/components/ActionMessage';
import ActionSection from '@ja-inertia/react/jetstream/components/ActionSection';
import ConfirmationModal from '@ja-inertia/react/jetstream/components/ConfirmationModal';
import DangerButton from '@ja-inertia/react/jetstream/components/DangerButton';
import DialogModal from '@ja-inertia/react/jetstream/components/DialogModal';
import FormSection from '@ja-inertia/react/jetstream/components/FormSection';
import InputError from '@ja-inertia/react/jetstream/components/InputError';
import InputLabel from '@ja-inertia/react/jetstream/components/InputLabel';
import PrimaryButton from '@ja-inertia/react/jetstream/components/PrimaryButton';
import TextInput from '@ja-inertia/react/jetstream/components/TextInput';
import SecondaryButton from '@ja-inertia/react/jetstream/components/SecondaryButton';
import SectionBorder from '@ja-inertia/react/jetstream/components/SectionBorder';
import {
  JetstreamTeamPermissions,
  Nullable,
  Role,
  Team,
  TeamInvitation,
  User,
} from '@ja-inertia/react/jetstream/types';
import { Inertia } from '@pckg/@inertiajs/inertia';
import { useForm } from '@pckg/@inertiajs/inertia-react';
import { mergeCssClasses as classNames } from '@blazervel-ui/utils';
import React, { useState } from '@pckg/preact/compat';

interface UserMembership extends User {
  membership: {
    role: string;
  };
}

interface Props {
  team: Team & {
    team_invitations: TeamInvitation[];
    users: UserMembership[];
  };
  availableRoles: Role[];
  permissions: JetstreamTeamPermissions;
}

export default ({
  team,
  availableRoles,
  permissions,
}: Props) => {
  //const route = useRoute();
  const addTeamMemberForm = useForm({
    email: '',
    role: null as Nullable<string>,
  });
  const updateRoleForm = useForm({
    role: null as Nullable<string>,
  });
  const leaveTeamForm = useForm({});
  const removeTeamMemberForm = useForm({});
  const [currentlyManagingRole, setCurrentlyManagingRole] = useState(false);
  const [managingRoleFor, setManagingRoleFor] = useState<Nullable<User>>(null);
  const [confirmingLeavingTeam, setConfirmingLeavingTeam] = useState(false);
  const [teamMemberBeingRemoved, setTeamMemberBeingRemoved] =
    useState<Nullable<User>>(null);
  const page = useTypedPage();

  function addTeamMember() {
    addTeamMemberForm.post(route('team-members.store', [team]), {
      errorBag: 'addTeamMember',
      preserveScroll: true,
      onSuccess: () => addTeamMemberForm.reset(),
    });
  }

  function cancelTeamInvitation(invitation: TeamInvitation) {
    Inertia.delete(route('team-invitations.destroy', [invitation]), {
      preserveScroll: true,
    });
  }

  function manageRole(teamMember: UserMembership) {
    setManagingRoleFor(teamMember);
    updateRoleForm.setData('role', teamMember.membership.role);
    setCurrentlyManagingRole(true);
  }

  function updateRole() {
    if (!managingRoleFor) {
      return;
    }
    updateRoleForm.put(route('team-members.update', [team, managingRoleFor]), {
      preserveScroll: true,
      onSuccess: () => setCurrentlyManagingRole(false),
    });
  }

  function confirmLeavingTeam() {
    setConfirmingLeavingTeam(true);
  }

  function leaveTeam() {
    leaveTeamForm.delete(
      route('team-members.destroy', [team, page.props.user]),
    );
  }

  function confirmTeamMemberRemoval(teamMember: User) {
    setTeamMemberBeingRemoved(teamMember);
  }

  function removeTeamMember() {
    if (!teamMemberBeingRemoved) {
      return;
    }
    removeTeamMemberForm.delete(
      route('team-members.destroy', [team, teamMemberBeingRemoved]),
      {
        errorBag: 'removeTeamMember',
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => setTeamMemberBeingRemoved(null),
      },
    );
  }

  function displayableRole(role: string) {
    return availableRoles.find(r => r.key === role)?.name;
  }

  return (
    <div>
      {permissions.canAddTeamMembers ? (
        <div>
          <SectionBorder />

          <FormSection
            onSubmit={addTeamMember}
            title={'Add Team Member'}
            description={
              'Add a new team member to your team, allowing them to collaborate with you.'
            }
            renderActions={() => (
              <>
                <ActionMessage
                  on={addTeamMemberForm.recentlySuccessful}
                  className="mr-3"
                >
                  Added.
                </ActionMessage>

                <PrimaryButton
                  type="submit"
                  className={classNames({
                    'opacity-25': addTeamMemberForm.processing,
                  })}
                  disabled={addTeamMemberForm.processing}
                >
                  Add
                </PrimaryButton>
              </>
            )}
          >
            <div className="col-span-6">
              <div className="max-w-xl text-sm text-gray-600">
                Please provide the email address of the person you would like to
                add to this team.
              </div>
            </div>

            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={addTeamMemberForm.data.email}
                onChange={e =>
                  addTeamMemberForm.setData('email', e.currentTarget.value)
                }
              />
              <InputError
                message={addTeamMemberForm.errors.email}
                className="mt-2"
              />
            </div>

            {availableRoles.length > 0 ? (
              <div className="col-span-6 lg:col-span-4">
                <InputLabel htmlFor="roles" value="Role" />
                <InputError
                  message={addTeamMemberForm.errors.role}
                  className="mt-2"
                />

                <div className="relative z-0 mt-1 border border-gray-200 rounded-lg cursor-pointer">
                  {availableRoles.map((role, i) => (
                    <button
                      type="button"
                      className={classNames(
                        'relative px-4 py-3 inline-flex w-full rounded-lg focus:z-10 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200',
                        {
                          'border-t border-gray-200 rounded-t-none': i > 0,
                          'rounded-b-none':
                            i != Object.keys(availableRoles).length - 1,
                        },
                      )}
                      onClick={() =>
                        addTeamMemberForm.setData('role', role.key)
                      }
                      key={role.key}
                    >
                      <div
                        className={classNames({
                          'opacity-50':
                            addTeamMemberForm.data.role &&
                            addTeamMemberForm.data.role != role.key,
                        })}
                      >
                        {/* <!-- Role Name --> */}
                        <div className="flex items-center">
                          <div
                            className={classNames('text-sm text-gray-600', {
                              'font-semibold':
                                addTeamMemberForm.data.role == role.key,
                            })}
                          >
                            {role.name}
                          </div>

                          {addTeamMemberForm.data.role == role.key ? (
                            <svg
                              className="ml-2 h-5 w-5 text-green-400"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          ) : null}
                        </div>

                        {/* <!-- Role Description --> */}
                        <div className="mt-2 text-xs text-gray-600">
                          {role.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </FormSection>
        </div>
      ) : null}

      {team.team_invitations.length > 0 && permissions.canAddTeamMembers ? (
        <div>
          <SectionBorder />

          {/* <!-- Team Member Invitations --> */}
          <div className="mt-10 sm:mt-0" />

          <ActionSection
            title={'Pending Team Invitations'}
            description={
              'These people have been invited to your team and have been sent an invitation email. They may join the team by accepting the email invitation.'
            }
          >
            {/* <!-- Pending Team Member Invitation List --> */}
            <div className="space-y-6">
              {team.team_invitations.map(invitation => (
                <div
                  className="flex items-center justify-between"
                  key={invitation.id}
                >
                  <div className="text-gray-600">{invitation.email}</div>

                  <div className="flex items-center">
                    {/* <!-- Cancel Team Invitation --> */}
                    {permissions.canRemoveTeamMembers ? (
                      <button
                        className="cursor-pointer ml-6 text-sm text-red-500 focus:outline-none"
                        onClick={() => cancelTeamInvitation(invitation)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ActionSection>
        </div>
      ) : null}

      {team.users.length > 0 ? (
        <div>
          <SectionBorder />

          <div className="mt-10 sm:mt-0" />

          <ActionSection
            title={'Team Members'}
            description={'All of the people that are part of this team.'}
          >
            <div className="space-y-6">
              {team.users.map(user => (
                <div
                  className="flex items-center justify-between"
                  key={user.id}
                >
                  <div className="flex items-center">
                    <img
                      className="w-8 h-8 rounded-full"
                      src={user.profile_photo_url}
                      alt={user.name}
                    />
                    <div className="ml-4">{user.name}</div>
                  </div>

                  <div className="flex items-center">
                    {/* <!-- Manage Team Member Role --> */}
                    {permissions.canAddTeamMembers &&
                    availableRoles.length ? (
                      <button
                        className="ml-2 text-sm text-gray-400 underline"
                        onClick={() => manageRole(user)}
                      >
                        {displayableRole(user.membership.role)}
                      </button>
                    ) : availableRoles.length ? (
                      <div className="ml-2 text-sm text-gray-400">
                        {displayableRole(user.membership.role)}
                      </div>
                    ) : null}

                    {/* <!-- Leave Team --> */}
                    {page.props.user.id === user.id ? (
                      <button
                        className="cursor-pointer ml-6 text-sm text-red-500"
                        onClick={confirmLeavingTeam}
                      >
                        Leave
                      </button>
                    ) : null}

                    {/* <!-- Remove Team Member --> */}
                    {permissions.canRemoveTeamMembers ? (
                      <button
                        className="cursor-pointer ml-6 text-sm text-red-500"
                        onClick={() => confirmTeamMemberRemoval(user)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ActionSection>
        </div>
      ) : null}

      {/* <!-- Role Management Modal --> */}
      <DialogModal
        isOpen={currentlyManagingRole}
        onClose={() => setCurrentlyManagingRole(false)}
      >
        <DialogModal.Content title={'Manage Role'}></DialogModal.Content>
        {managingRoleFor ? (
          <div>
            <div className="relative z-0 mt-1 border border-gray-200 rounded-lg cursor-pointer">
              {availableRoles.map((role, i) => (
                <button
                  type="button"
                  className={classNames(
                    'relative px-4 py-3 inline-flex w-full rounded-lg focus:z-10 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200',
                    {
                      'border-t border-gray-200 rounded-t-none': i > 0,
                      'rounded-b-none':
                        i !== Object.keys(availableRoles).length - 1,
                    },
                  )}
                  onClick={() => updateRoleForm.setData('role', role.key)}
                  key={role.key}
                >
                  <div
                    className={classNames({
                      'opacity-50':
                        updateRoleForm.data.role &&
                        updateRoleForm.data.role !== role.key,
                    })}
                  >
                    {/* <!-- Role Name --> */}
                    <div className="flex items-center">
                      <div
                        className={classNames('text-sm text-gray-600', {
                          'font-semibold':
                            updateRoleForm.data.role === role.key,
                        })}
                      >
                        {role.name}
                      </div>
                      {updateRoleForm.data.role === role.key ? (
                        <svg
                          className="ml-2 h-5 w-5 text-green-400"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      ) : null}
                    </div>

                    {/* <!-- Role Description --> */}
                    <div className="mt-2 text-xs text-gray-600">
                      {role.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <DialogModal.Footer>
          <SecondaryButton onClick={() => setCurrentlyManagingRole(false)}>
            Cancel
          </SecondaryButton>

          <PrimaryButton
            onClick={updateRole}
            className={classNames('ml-2', {
              'opacity-25': updateRoleForm.processing,
            })}
            disabled={updateRoleForm.processing}
          >
            Save
          </PrimaryButton>
        </DialogModal.Footer>
      </DialogModal>

      {/* <!-- Leave Team Confirmation Modal --> */}
      <ConfirmationModal
        isOpen={confirmingLeavingTeam}
        onClose={() => setConfirmingLeavingTeam(false)}
      >
        <ConfirmationModal.Content title={'Leave Team'}>
          Are you sure you would like to leave this team?
        </ConfirmationModal.Content>
        <ConfirmationModal.Footer>
          <SecondaryButton onClick={() => setConfirmingLeavingTeam(false)}>
            Cancel
          </SecondaryButton>

          <DangerButton
            onClick={leaveTeam}
            className={classNames('ml-2', {
              'opacity-25': leaveTeamForm.processing,
            })}
            disabled={leaveTeamForm.processing}
          >
            Leave
          </DangerButton>
        </ConfirmationModal.Footer>
      </ConfirmationModal>

      {/* <!-- Remove Team Member Confirmation Modal --> */}
      <ConfirmationModal
        isOpen={!!teamMemberBeingRemoved}
        onClose={() => setTeamMemberBeingRemoved(null)}
      >
        <ConfirmationModal.Content title={'Remove Team Member'}>
          Are you sure you would like to remove this person from the team?
        </ConfirmationModal.Content>
        <ConfirmationModal.Footer>
          <SecondaryButton onClick={() => setTeamMemberBeingRemoved(null)}>
            Cancel
          </SecondaryButton>

          <DangerButton
            onClick={removeTeamMember}
            className={classNames('ml-2', {
              'opacity-25': removeTeamMemberForm.processing,
            })}
            disabled={removeTeamMemberForm.processing}
          >
            Remove
          </DangerButton>
        </ConfirmationModal.Footer>
      </ConfirmationModal>
    </div>
  );
}
