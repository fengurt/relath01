package com.relath.api;

import com.relath.graph.GraphAnalyticsService;
import com.relath.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GraphAnalyticsController.class)
@Import(SecurityConfig.class)
class GraphAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GraphAnalyticsService graphAnalyticsService;

    @Test
    void summaryReturnsPayloadForAnonymous() throws Exception {
        when(graphAnalyticsService.coreLabelCounts()).thenReturn(
                Map.of("status", "ok", "consumers", 0L, "merchants", 0L)
        );
        mockMvc.perform(get("/api/v1/public/graph/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.consumers").value(0));
    }

    @Test
    void introducerPathsPassesParameters() throws Exception {
        when(graphAnalyticsService.introduceUpstreamPaths(eq("c1"), eq(3), eq(10)))
                .thenReturn(Map.of("status", "ok", "paths", java.util.List.of()));
        mockMvc.perform(get("/api/v1/public/graph/consumers/c1/introducer-paths")
                        .param("maxDepth", "3")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
        verify(graphAnalyticsService).introduceUpstreamPaths("c1", 3, 10);
    }

    @Test
    void introducerPathsUsesDefaultsForOptionalParams() throws Exception {
        when(graphAnalyticsService.introduceUpstreamPaths(eq("c2"), isNull(), isNull()))
                .thenReturn(Map.of("status", "ok"));
        mockMvc.perform(get("/api/v1/public/graph/consumers/c2/introducer-paths"))
                .andExpect(status().isOk());
    }
}
