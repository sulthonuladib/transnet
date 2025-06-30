import type { FC } from 'hono/jsx';
import type { Organization, OrganizationMembership, User } from '../database/schema';

interface OrganizationManagerProps {
  user: User;
  organizations: Array<{
    membership: OrganizationMembership;
    organization: Organization;
  }>;
  currentOrganization?: Organization | null;
}

export const OrganizationManager: FC<OrganizationManagerProps> = ({
  user,
  organizations,
  currentOrganization,
}) => {
  return (
    <div class='container mx-auto px-4 py-8'>
      <h1 class='mb-8 text-3xl font-bold'>Organization Management</h1>

      {/* Current Organization */}
      <div class='card bg-base-200 mb-8 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title'>Current Organization</h2>
          {currentOrganization ? (
            <div>
              <p class='text-lg font-semibold'>{currentOrganization.name}</p>
              <p class='text-sm opacity-70'>Slug: {currentOrganization.slug}</p>
              {currentOrganization.description && (
                <p class='mt-2'>{currentOrganization.description}</p>
              )}
            </div>
          ) : (
            <p class='text-warning'>No organization selected</p>
          )}
        </div>
      </div>

      {/* Organizations List */}
      <div class='card bg-base-200 mb-8 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title mb-4'>Your Organizations</h2>
          {organizations.length > 0 ? (
            <div class='space-y-4'>
              {organizations.map(({ membership, organization }) => (
                <div
                  key={organization.id}
                  class='flex items-center justify-between rounded-lg bg-base-300 p-4'
                >
                  <div>
                    <h3 class='font-semibold'>{organization.name}</h3>
                    <p class='text-sm opacity-70'>
                      Role: {membership.role} | Status: {membership.status}
                    </p>
                  </div>
                  <div class='flex gap-2'>
                    {currentOrganization?.id !== organization.id && (
                      <button
                        class='btn btn-primary btn-sm'
                        hx-post={`/api/organizations/switch/${organization.id}`}
                        hx-target='#main-content'
                        hx-swap='innerHTML'
                      >
                        Switch
                      </button>
                    )}
                    {membership.role === 'owner' && (
                      <button
                        class='btn btn-ghost btn-sm'
                        hx-get={`/organizations/${organization.slug}/settings`}
                        hx-target='#main-content'
                        hx-swap='innerHTML'
                      >
                        Settings
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p class='text-warning'>You are not a member of any organizations</p>
          )}
        </div>
      </div>

      {/* Create New Organization */}
      <div class='card bg-base-200 mb-8 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title mb-4'>Create New Organization</h2>
          <form
            hx-post='/api/organizations/create'
            hx-target='#main-content'
            hx-swap='innerHTML'
          >
            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Organization Name</span>
              </label>
              <input
                type='text'
                name='name'
                placeholder='My Organization'
                class='input input-bordered'
                required
              />
            </div>
            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Organization Slug</span>
              </label>
              <input
                type='text'
                name='slug'
                placeholder='my-organization'
                class='input input-bordered'
                pattern='[a-z0-9-]+'
                required
              />
              <label class='label'>
                <span class='label-text-alt'>
                  URL-friendly identifier (lowercase letters, numbers, and hyphens only)
                </span>
              </label>
            </div>
            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Description (Optional)</span>
              </label>
              <textarea
                name='description'
                placeholder='Describe your organization...'
                class='textarea textarea-bordered'
                rows={3}
              />
            </div>
            <button type='submit' class='btn btn-primary'>
              <span class='htmx-indicator loading loading-spinner loading-sm'></span>
              Create Organization
            </button>
          </form>
        </div>
      </div>

      {/* Join Organization */}
      <div class='card bg-base-200 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title mb-4'>Join Organization</h2>
          <form
            hx-post='/api/organizations/join'
            hx-target='#main-content'
            hx-swap='innerHTML'
          >
            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Invitation Code</span>
              </label>
              <input
                type='text'
                name='invitationCode'
                placeholder='Enter invitation code'
                class='input input-bordered'
                required
              />
              <label class='label'>
                <span class='label-text-alt'>
                  Enter the invitation code provided by your organization admin
                </span>
              </label>
            </div>
            <button type='submit' class='btn btn-secondary'>
              <span class='htmx-indicator loading loading-spinner loading-sm'></span>
              Join Organization
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface OrganizationSettingsProps {
  organization: Organization;
  isOwner: boolean;
  members: Array<{
    user: User;
    membership: OrganizationMembership;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    token: string;
    expiresAt: Date;
  }>;
}

export const OrganizationSettings: FC<OrganizationSettingsProps> = ({
  organization,
  isOwner,
  members,
  invitations,
}) => {
  return (
    <div class='container mx-auto px-4 py-8'>
      <div class='mb-8 flex items-center justify-between'>
        <h1 class='text-3xl font-bold'>{organization.name} Settings</h1>
        <button
          class='btn btn-ghost'
          hx-get='/organizations'
          hx-target='#main-content'
          hx-swap='innerHTML'
        >
          Back to Organizations
        </button>
      </div>

      {/* Organization Info */}
      <div class='card bg-base-200 mb-8 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title'>Organization Information</h2>
          <div class='space-y-2'>
            <p>
              <strong>Name:</strong> {organization.name}
            </p>
            <p>
              <strong>Slug:</strong> {organization.slug}
            </p>
            {organization.description && (
              <p>
                <strong>Description:</strong> {organization.description}
              </p>
            )}
            <p>
              <strong>Created:</strong>{' '}
              {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div class='card bg-base-200 mb-8 shadow-xl'>
        <div class='card-body'>
          <h2 class='card-title mb-4'>Members</h2>
          <div class='overflow-x-auto'>
            <table class='table'>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  {isOwner && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map(({ user, membership }) => (
                  <tr key={membership.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span class='badge badge-primary'>{membership.role}</span>
                    </td>
                    <td>
                      <span
                        class={`badge ${membership.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                      >
                        {membership.status}
                      </span>
                    </td>
                    <td>{new Date(membership.joinedAt).toLocaleDateString()}</td>
                    {isOwner && membership.role !== 'owner' && (
                      <td>
                        <button
                          class='btn btn-error btn-xs'
                          hx-delete={`/api/organizations/${organization.id}/members/${membership.id}`}
                          hx-confirm='Are you sure you want to remove this member?'
                          hx-target='#main-content'
                          hx-swap='innerHTML'
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invitations */}
      {isOwner && (
        <div class='card bg-base-200 shadow-xl'>
          <div class='card-body'>
            <h2 class='card-title mb-4'>Invitations</h2>
            
            {/* Create Invitation Form */}
            <form
              hx-post={`/api/organizations/${organization.id}/invitations`}
              hx-target='#main-content'
              hx-swap='innerHTML'
              class='mb-6'
            >
              <div class='flex gap-4'>
                <div class='form-control flex-1'>
                  <input
                    type='email'
                    name='email'
                    placeholder='Email address'
                    class='input input-bordered'
                    required
                  />
                </div>
                <div class='form-control'>
                  <select name='role' class='select select-bordered'>
                    <option value='member'>Member</option>
                    <option value='admin'>Admin</option>
                  </select>
                </div>
                <button type='submit' class='btn btn-primary'>
                  Send Invitation
                </button>
              </div>
            </form>

            {/* Active Invitations */}
            {invitations.length > 0 ? (
              <div class='overflow-x-auto'>
                <table class='table'>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Expires</th>
                      <th>Invitation Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map(invitation => (
                      <tr key={invitation.id}>
                        <td>{invitation.email}</td>
                        <td>
                          <span class='badge badge-primary'>{invitation.role}</span>
                        </td>
                        <td>
                          <span
                            class={`badge ${
                              invitation.status === 'pending'
                                ? 'badge-warning'
                                : invitation.status === 'accepted'
                                  ? 'badge-success'
                                  : 'badge-error'
                            }`}
                          >
                            {invitation.status}
                          </span>
                        </td>
                        <td>{new Date(invitation.expiresAt).toLocaleDateString()}</td>
                        <td>
                          <code class='text-xs'>{invitation.token}</code>
                        </td>
                        <td>
                          {invitation.status === 'pending' && (
                            <button
                              class='btn btn-error btn-xs'
                              hx-delete={`/api/organizations/${organization.id}/invitations/${invitation.id}`}
                              hx-confirm='Are you sure you want to cancel this invitation?'
                              hx-target='#main-content'
                              hx-swap='innerHTML'
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p class='text-sm opacity-70'>No pending invitations</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};