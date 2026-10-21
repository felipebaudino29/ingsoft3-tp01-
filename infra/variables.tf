variable "image_repo_api" {
  description = "Imagen del backend en ghcr.io, SIN la etiqueta"
  default     = "ghcr.io/felipebaudino29/ingsoft3-tp01--backend"
}

variable "image_repo_front" {
  description = "Imagen del frontend en ghcr.io, SIN la etiqueta"
  default     = "ghcr.io/felipebaudino29/ingsoft3-tp01--frontend"
}

variable "image_tag" {
  description = "Etiqueta sha-<commit> de un merge a main ya publicado por el pipeline"
  default     = "sha-4b3943272434da5c7514300dd58e6600bd787a60" # la imagen del v7.0.0
}

variable "neon_org_id" {
  description = "Organización de Neon (org-...): Neon → Organization settings"
  type        = string
}

variable "region" {
  description = "frankfurt | ohio | oregon | singapore | virginia"
  default     = "oregon"
}
