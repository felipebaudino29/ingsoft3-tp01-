terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # fijada: el repo del provider está archivado
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}   # lee NEON_API_KEY
provider "render" {} # lee RENDER_API_KEY y RENDER_OWNER_ID

# --- Base de datos de PREPROD: un proyecto de Neon propio, que se puede destruir entero ---

resource "neon_project" "preprod" {
  name   = "gestor-materias-preprod"
  org_id = var.neon_org_id # Neon exige la organización al crear proyectos

  # Sin esto el primer apply falla: el default (86400) supera el tope del plan gratuito.
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

locals {
  # La cadena de conexión se ARMA con lo que devolvió Neon: nadie la copia y pega.
  # El backend la lee de DATABASE_URL y se conecta con SSL.
  database_url = "postgresql://${neon_role.preprod.name}:${urlencode(neon_role.preprod.password)}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"
}

# --- Servicios de PREPROD en Render: corren la imagen publicada por el pipeline (TP7) ---

resource "render_web_service" "api" {
  name   = "gestor-api-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_api # sin la etiqueta
      tag       = var.image_tag
    }
  }

  env_vars = {
    DATABASE_URL = { value = local.database_url }
  }
}

resource "render_web_service" "front" {
  name   = "gestor-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = {
    # La dirección del backend sale del atributo url de su propia api, sin barra final.
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") }
    DNS_RESOLVER = { value = "8.8.8.8" }
  }
}
