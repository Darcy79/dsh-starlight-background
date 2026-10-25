/**
 * Host half of dsh-harmony-light.
 *
 * The plugin is intentionally browser-only: the light field is painted by the
 * Client module into `shell.overlay`. This entry exists so the Host loader can
 * mount the package and the Client registry can discover `dsh.client`.
 */
export const name = 'dsh-harmony-light'

export function apply() {
  // No Host services are needed.
}
