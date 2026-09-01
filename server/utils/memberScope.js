const TeamMember = require('../models/TeamMember');

/**
 * Gets allowed member IDs for a user based on role and team leadership hierarchy.
 * - Admin: returns { isAdmin: true, allowedMemberIds: null }
 * - Member (Regular): returns { isAdmin: false, allowedMemberIds: [memberId] }
 * - Member (Team Leader): returns { isAdmin: false, allowedMemberIds: [leaderId, ...subMemberIds] }
 */
const getMemberScope = async (reqUser) => {
  if (!reqUser || reqUser.role === 'Admin') {
    return { isAdmin: true, allowedMemberIds: null, memberRecord: null };
  }

  let member = null;
  if (reqUser.teamMemberId) {
    member = await TeamMember.findById(reqUser.teamMemberId);
  }
  if (!member && reqUser.email) {
    member = await TeamMember.findOne({ email: reqUser.email.toLowerCase() });
  }

  if (!member) {
    return { isAdmin: false, allowedMemberIds: [], memberRecord: null };
  }

  const allowedMemberIds = [member._id];

  if (member.isTeamLeader) {
    const subMembers = await TeamMember.find({ teamLeader: member._id });
    subMembers.forEach((sub) => {
      allowedMemberIds.push(sub._id);
    });
  }

  return {
    isAdmin: false,
    allowedMemberIds,
    memberRecord: member,
  };
};

module.exports = getMemberScope;
