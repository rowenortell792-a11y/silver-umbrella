module.exports = {
    governance: "TRIGGA_NORDY_SOVEREIGNTY",
    enforce: (data) => {
        return { ...data, constitution_enforced: true };
    }
};
