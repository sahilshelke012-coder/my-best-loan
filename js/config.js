window.MBL_CONFIG = {
  personalisedOfferUrl: "",
  trackLoanUrl: "",
  loginUrl: "",
  enquiryEndpoint: "",
  appointmentEndpoint: "",
  builderPartnershipUrl: "",
  partnerRegistrationUrl: "",
  phoneHref: "",
  emailHref: "",
  whatsappHref: "",
  aiUrl: "",

  /* Appointment calendar availability.
     Day keys use JavaScript day numbers: 0=Sunday ... 6=Saturday.
     Replace these sample slots with the final MyBestLoan schedule.
     A YYYY-MM-DD entry in dateOverrides replaces that day's weekly slots;
     use an empty array to block a specific date. */
  appointmentAvailability: {
    timeZone: "Asia/Kolkata",
    minLeadHours: 4,
    weekly: {
      "0": [],
      "1": ["10:00", "11:30", "14:00", "16:30"],
      "2": ["10:00", "11:30", "14:00", "16:30"],
      "3": ["10:00", "11:30", "14:00", "16:30"],
      "4": ["10:00", "11:30", "14:00", "16:30"],
      "5": ["10:00", "11:30", "14:00", "16:30"],
      "6": ["10:30", "12:00", "14:30"]
    },
    dateOverrides: {},
    blockedDates: []
  }
};
