#include "esp_vfs_spiffs.h"
#include <esp_http_server.h>
#include <esp_log.h>
#include <nvs_flash.h>
#include <esp_wifi.h>
#include <esp_event.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include "protocol_examples_common.h"

static const char *TAG = "web_server";

// Funkce pro obsluhu servírování souborů ze SPIFFS
esp_err_t serve_file(httpd_req_t *req, const char *filepath, const char *type) {
    FILE *file = fopen(filepath, "r");
    if (!file) {
        ESP_LOGE(TAG, "Failed to open file: %s", filepath);
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    char buf[1024];
    size_t read_bytes;
    httpd_resp_set_type(req, type);
    while ((read_bytes = fread(buf, 1, sizeof(buf), file)) > 0) {
        httpd_resp_send_chunk(req, buf, read_bytes);
    }
    httpd_resp_send_chunk(req, NULL, 0);
    fclose(file);
    return ESP_OK;
}

// Handlery pro jednotlivé soubory
esp_err_t index_html_get_handler(httpd_req_t *req) {
    return serve_file(req, "/spiffs/index.html", "text/html");
}

esp_err_t styles_css_get_handler(httpd_req_t *req) {
    return serve_file(req, "/spiffs/styles.css", "text/css");
}

esp_err_t script_js_get_handler(httpd_req_t *req) {
    return serve_file(req, "/spiffs/script.js", "application/javascript");
}

// Funkce pro spuštění webového serveru
void start_webserver(void) {
    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    httpd_uri_t index_html = {
        .uri       = "/",
        .method    = HTTP_GET,
        .handler   = index_html_get_handler,
        .user_ctx  = NULL
    };

    httpd_uri_t styles_css = {
        .uri       = "/styles.css",
        .method    = HTTP_GET,
        .handler   = styles_css_get_handler,
        .user_ctx  = NULL
    };

    httpd_uri_t script_js = {
        .uri       = "/script.js",
        .method    = HTTP_GET,
        .handler   = script_js_get_handler,
        .user_ctx  = NULL
    };

    if (httpd_start(&server, &config) == ESP_OK) {
        httpd_register_uri_handler(server, &index_html);
        httpd_register_uri_handler(server, &styles_css);
        httpd_register_uri_handler(server, &script_js);
    }
}

// Hlavní funkce
void app_main(void) {
    // Inicializace NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // Inicializace Wi-Fi
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    ESP_ERROR_CHECK(example_connect());

    // Mount SPIFFS
    esp_vfs_spiffs_conf_t conf = {
      .base_path = "/spiffs",
      .partition_label = NULL,
      .max_files = 5,
      .format_if_mount_failed = true
    };

    if (esp_vfs_spiffs_register(&conf) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to mount or format filesystem");
        return;
    }

    // Spuštění webového serveru
    start_webserver();
}
