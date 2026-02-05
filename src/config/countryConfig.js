export const countryConfig = {
    US: {
        name: "Estados Unidos",
        iso2: "US",
        phoneCode: "1",
        prefix: "KU",
        documentTypes: [
            {
                label: "Driver's License",
                value: "4", // ID from Database
                validation: {
                    pattern: /^[A-Za-z0-9]+$/,
                    minLength: 5,
                    maxLength: 20,
                    description: "Alphanumeric, 5-20 characters"
                }
            },
            {
                label: "Passport",
                value: "1", // ID from Database (Same as VE) or specific US passport ID if different
                validation: {
                    pattern: /^[A-Za-z0-9]+$/,
                    minLength: 6,
                    maxLength: 15,
                    description: "Alphanumeric, 6-15 characters"
                }
            }
        ],
        // Future expansion for dashboard
        dashboard: {
            menus: ["home", "shipments", "profile"], // Example
            features: ["tracking_us"]
        }
    },
    VE: {
        name: "Venezuela",
        iso2: "VE",
        phoneCode: "58",
        prefix: "KV",
        // Venezuela uses the dynamic API list usually, but we can map/extend here if needed
        // or leave empty to indicate "use default/API" behavior
        documentTypes: [],
        dashboard: {
            menus: ["home", "shipments", "profile", "consolidation"], // Example
            features: ["tracking_ve"]
        }
    },
    ES: {
        name: "España",
        iso2: "ES",
        phoneCode: "34",
        prefix: "KE",
        documentTypes: [
            {
                label: "DNI",
                value: "dni", // Will fallback to DB search by name
                validation: {
                    pattern: /^[0-9]{8}[A-Za-z]$/,
                    minLength: 9,
                    maxLength: 9,
                    description: "8 digits + 1 letter (e.g., 12345678A)"
                }
            },
            {
                label: "NIE",
                value: "nie", // Will fallback to DB search by name
                validation: {
                    pattern: /^[XYZxyz][0-9]{7}[A-Za-z]$/,
                    minLength: 9,
                    maxLength: 9,
                    description: "Start with X/Y/Z + 7 digits + letter"
                }
            },
            {
                label: "Pasaporte",
                value: "1", // Use ID 1 for Passport
                validation: {
                    pattern: /^[A-Za-z0-9]+$/,
                    minLength: 6,
                    maxLength: 15,
                    description: "Alphanumeric, 6-15 characters"
                }
            }
        ],
        dashboard: {
            menus: ["home", "shipments", "profile"],
            features: ["tracking_es"]
        }
    },
    // Fallback or other countries can be added here
    DEFAULT: {
        documentTypes: [] // Use API defaults
    }
};

export const getCountryConfig = (iso2) => {
    return countryConfig[iso2] || countryConfig.DEFAULT;
};
