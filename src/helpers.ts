export function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export function semver() {
    return /\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig;
}

/**
 * Returns the versions from ember -v
 * match[1] = ember version
 * match[2] = node version
 * match[3] = os info
 * 
 * @export function
 * @returns RegExp
 */
export function versionDumpParse(): RegExp {
    return /ember-cli:\s*(.*)\s*\nnode:\s(.*)\s*\nos:\s*(.*)/ig;
}