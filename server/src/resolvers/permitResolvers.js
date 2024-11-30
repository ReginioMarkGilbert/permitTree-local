// In createPermit mutation
await logUserActivity({
   userId: context.user.id,
   type: 'APPLICATION_SUBMIT',
   details: `Submitted ${input.applicationType} application`,
   metadata: {
      applicationId: newPermit._id,
      applicationNumber: newPermit.applicationNumber
   }
});
