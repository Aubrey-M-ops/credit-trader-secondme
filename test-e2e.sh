#!/bin/bash

# SecondMe Credit Trader - E2E Test Script
# Testing all API endpoints and workflows

set -e  # Exit on error

BASE_URL="http://localhost:3000"
TEST_RESULTS=()
FAILED_TESTS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_test() {
    echo -e "\n${YELLOW}=== TEST: $1 ===${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
    TEST_RESULTS+=("✓ $1")
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    TEST_RESULTS+=("✗ $1")
    FAILED_TESTS+=("$1")
}

log_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Test API health
log_test "Scenario 0: Health Check"
HEALTH=$(curl -s $BASE_URL/api/health 2>&1)
if [ $? -eq 0 ]; then
    log_success "API is reachable"
else
    log_error "API is not reachable"
    exit 1
fi

# Scenario 1: Agent Registration
log_test "Scenario 1: Agent Registration Flow"

log_info "Registering Agent-1..."
AGENT1_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"TestAgent-1"}')

echo "$AGENT1_RESPONSE" | jq . 2>/dev/null || echo "$AGENT1_RESPONSE"

# Extract fields
AGENT1_ID=$(echo "$AGENT1_RESPONSE" | jq -r '.id // empty')
AGENT1_API_KEY=$(echo "$AGENT1_RESPONSE" | jq -r '.apiKey // empty')
AGENT1_CLAIM_CODE=$(echo "$AGENT1_RESPONSE" | jq -r '.claimCode // empty')
AGENT1_VERIFY_CODE=$(echo "$AGENT1_RESPONSE" | jq -r '.verificationCode // empty')
AGENT1_CLAIM_URL=$(echo "$AGENT1_RESPONSE" | jq -r '.claimUrl // empty')

# Validate registration
if [ -n "$AGENT1_API_KEY" ] && [[ "$AGENT1_API_KEY" == ct_* ]]; then
    log_success "Agent-1 registered with valid API key: ${AGENT1_API_KEY:0:20}..."
else
    log_error "Agent-1 registration failed or invalid API key"
fi

if [ -n "$AGENT1_CLAIM_CODE" ] && [ ${#AGENT1_CLAIM_CODE} -eq 8 ]; then
    log_success "Claim code generated: $AGENT1_CLAIM_CODE"
else
    log_error "Invalid claim code: $AGENT1_CLAIM_CODE"
fi

if [ -n "$AGENT1_VERIFY_CODE" ]; then
    log_success "Verification code generated: $AGENT1_VERIFY_CODE"
else
    log_error "Verification code missing"
fi

# Scenario 2: Agent Authentication
log_test "Scenario 2: Agent Authentication"

log_info "Testing GET /api/agents/me..."
ME_RESPONSE=$(curl -s $BASE_URL/api/agents/me \
  -H "Authorization: Bearer $AGENT1_API_KEY")

echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"

ME_ID=$(echo "$ME_RESPONSE" | jq -r '.id // empty')
if [ -n "$ME_ID" ] && [ -n "$AGENT1_ID" ]; then
    log_success "Agent authenticated successfully (ID: $ME_ID)"
else
    log_error "Agent authentication failed - ME_ID: $ME_ID, AGENT1_ID: $AGENT1_ID"
fi

log_info "Testing POST /api/agents/heartbeat..."
HEARTBEAT_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents/heartbeat \
  -H "Authorization: Bearer $AGENT1_API_KEY")

echo "$HEARTBEAT_RESPONSE" | jq . 2>/dev/null || echo "$HEARTBEAT_RESPONSE"

HB_SUCCESS=$(echo "$HEARTBEAT_RESPONSE" | jq -r '.success // empty')
if [ "$HB_SUCCESS" = "true" ]; then
    log_success "Heartbeat updated successfully"
else
    log_error "Heartbeat update failed"
fi

# Scenario 3: Claim Page (Manual test required)
log_test "Scenario 3: Claim Flow (Manual Test Required)"
log_info "Claim URL: $AGENT1_CLAIM_URL"
log_info "Verification Code: $AGENT1_VERIFY_CODE"
log_info "Please manually test the claim flow in browser"

# Scenario 4: Task Publishing
log_test "Scenario 4: Task Publishing Flow"

log_info "Publishing a task..."
TASK1_RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENT1_API_KEY" \
  -d '{
    "title": "E2E Test Task",
    "description": "This is an end-to-end test task",
    "estimatedTokens": 100,
    "priority": "medium",
    "context": {"type": "test"}
  }')

echo "$TASK1_RESPONSE" | jq . 2>/dev/null || echo "$TASK1_RESPONSE"

TASK1_ID=$(echo "$TASK1_RESPONSE" | jq -r '.id // empty')
TASK1_STATUS=$(echo "$TASK1_RESPONSE" | jq -r '.status // empty')
TASK1_CREDITS=$(echo "$TASK1_RESPONSE" | jq -r '.estimatedCredits // empty')

if [ -n "$TASK1_ID" ] && [ "$TASK1_STATUS" = "pending" ]; then
    log_success "Task published successfully: $TASK1_ID"
else
    log_error "Task publishing failed"
fi

if [ -n "$TASK1_CREDITS" ]; then
    log_success "Task credits calculated: $TASK1_CREDITS"
else
    log_error "Task credits not calculated"
fi

# Check agent credits after publishing
log_info "Checking Agent-1 credits after publishing..."
AGENT1_AFTER_PUBLISH=$(curl -s $BASE_URL/api/agents/me \
  -H "Authorization: Bearer $AGENT1_API_KEY")

AGENT1_CREDITS=$(echo "$AGENT1_AFTER_PUBLISH" | jq -r '.credits // empty')
log_info "Agent-1 current credits: $AGENT1_CREDITS"

# Scenario 5: Task Query
log_test "Scenario 5: Task Query"

log_info "Querying pending tasks..."
TASKS_PENDING=$(curl -s "$BASE_URL/api/tasks?status=pending")
echo "$TASKS_PENDING" | jq . 2>/dev/null || echo "$TASKS_PENDING"

PENDING_COUNT=$(echo "$TASKS_PENDING" | jq -r '.total // 0')
log_info "Pending tasks count: $PENDING_COUNT"

log_info "Querying tasks as publisher..."
MY_TASKS=$(curl -s "$BASE_URL/api/tasks?role=publisher" \
  -H "Authorization: Bearer $AGENT1_API_KEY")
echo "$MY_TASKS" | jq . 2>/dev/null || echo "$MY_TASKS"

MY_TASKS_COUNT=$(echo "$MY_TASKS" | jq -r '.total // 0')
if [ "$MY_TASKS_COUNT" -ge 1 ]; then
    log_success "Publisher can see their published tasks"
else
    log_error "Publisher tasks query failed"
fi

# Scenario 6: Agent-2 Registration and Task Acceptance
log_test "Scenario 6: Task Acceptance Flow"

log_info "Registering Agent-2..."
AGENT2_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"TestAgent-2"}')

AGENT2_ID=$(echo "$AGENT2_RESPONSE" | jq -r '.id // empty')
AGENT2_API_KEY=$(echo "$AGENT2_RESPONSE" | jq -r '.apiKey // empty')

if [ -n "$AGENT2_API_KEY" ]; then
    log_success "Agent-2 registered: ${AGENT2_API_KEY:0:20}..."
else
    log_error "Agent-2 registration failed"
fi

log_info "Agent-2 accepting task $TASK1_ID..."
ACCEPT_RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks/$TASK1_ID/accept \
  -H "Authorization: Bearer $AGENT2_API_KEY")

echo "$ACCEPT_RESPONSE" | jq . 2>/dev/null || echo "$ACCEPT_RESPONSE"

ACCEPT_STATUS=$(echo "$ACCEPT_RESPONSE" | jq -r '.status // empty')
WORKER_ID=$(echo "$ACCEPT_RESPONSE" | jq -r '.workerAgentId // empty')

if [ "$ACCEPT_STATUS" = "accepted" ] && [ "$WORKER_ID" = "$AGENT2_ID" ]; then
    log_success "Task accepted by Agent-2"
else
    log_error "Task acceptance failed"
fi

# Scenario 7: Task Completion
log_test "Scenario 7: Task Completion Flow"

log_info "Completing task $TASK1_ID..."
COMPLETE_RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks/$TASK1_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENT2_API_KEY" \
  -d '{
    "result": "Task completed successfully",
    "actualTokens": 80
  }')

echo "$COMPLETE_RESPONSE" | jq . 2>/dev/null || echo "$COMPLETE_RESPONSE"

COMPLETE_STATUS=$(echo "$COMPLETE_RESPONSE" | jq -r '.status // empty')
ACTUAL_TOKENS=$(echo "$COMPLETE_RESPONSE" | jq -r '.actualTokens // empty')

if [ "$COMPLETE_STATUS" = "completed" ]; then
    log_success "Task completed successfully (actualTokens: $ACTUAL_TOKENS)"
else
    log_error "Task completion failed - status: $COMPLETE_STATUS"
fi

# Check credit transfers
log_info "Checking Agent-2 credits (worker)..."
AGENT2_FINAL=$(curl -s $BASE_URL/api/agents/me \
  -H "Authorization: Bearer $AGENT2_API_KEY")
AGENT2_CREDITS=$(echo "$AGENT2_FINAL" | jq -r '.credits // empty')
log_info "Agent-2 credits: $AGENT2_CREDITS (should have earned 80)"

log_info "Checking Agent-1 credits (publisher)..."
AGENT1_FINAL=$(curl -s $BASE_URL/api/agents/me \
  -H "Authorization: Bearer $AGENT1_API_KEY")
AGENT1_FINAL_CREDITS=$(echo "$AGENT1_FINAL" | jq -r '.credits // empty')
log_info "Agent-1 credits: $AGENT1_FINAL_CREDITS (should have refund of 20)"

# Verify credit calculations
AGENT2_EARNED=$((AGENT2_CREDITS - 100))
AGENT1_REFUND=$((AGENT1_FINAL_CREDITS - 0))

if [ "$AGENT2_EARNED" -eq 80 ]; then
    log_success "Worker earned correct credits: 80"
else
    log_error "Worker earned incorrect credits: $AGENT2_EARNED (expected 80)"
fi

if [ "$AGENT1_REFUND" -eq 20 ]; then
    log_success "Publisher refund correct: 20"
else
    log_error "Publisher refund incorrect: $AGENT1_REFUND (expected 20)"
fi

# Scenario 8: Activity Feed
log_test "Scenario 8: Activity Feed and Statistics"

log_info "Fetching activity feed..."
FEED_RESPONSE=$(curl -s "$BASE_URL/api/activities?limit=10")
echo "$FEED_RESPONSE" | jq . 2>/dev/null || echo "$FEED_RESPONSE"

FEED_COUNT=$(echo "$FEED_RESPONSE" | jq -r '.total // 0')
if [ "$FEED_COUNT" -ge 3 ]; then
    log_success "Activity feed has entries: $FEED_COUNT"
else
    log_error "Activity feed is missing entries"
fi

log_info "Fetching platform statistics..."
STATS_RESPONSE=$(curl -s "$BASE_URL/api/stats")
echo "$STATS_RESPONSE" | jq . 2>/dev/null || echo "$STATS_RESPONSE"

ACTIVE_AGENTS=$(echo "$STATS_RESPONSE" | jq -r '.activeAgents // 0')
TOTAL_TASKS=$(echo "$STATS_RESPONSE" | jq -r '.totalTasks // 0')
TOKENS_SAVED=$(echo "$STATS_RESPONSE" | jq -r '.tokensSaved // 0')

log_info "Active Users (SecondMe): $ACTIVE_AGENTS"
log_info "Total Tasks: $TOTAL_TASKS"
log_info "Tokens Saved: $TOKENS_SAVED"

if [ "$TOTAL_TASKS" -ge 1 ] && [ "$TOKENS_SAVED" -gt 0 ]; then
    log_success "Statistics show correct data"
else
    log_error "Statistics incorrect"
fi

# Final Summary
echo -e "\n${YELLOW}=== TEST SUMMARY ===${NC}"
echo "Total tests: ${#TEST_RESULTS[@]}"
echo "Failed tests: ${#FAILED_TESTS[@]}"

echo -e "\n${YELLOW}All Results:${NC}"
for result in "${TEST_RESULTS[@]}"; do
    echo "  $result"
done

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "\n${RED}Failed Tests:${NC}"
    for failed in "${FAILED_TESTS[@]}"; do
        echo "  ✗ $failed"
    done
    exit 1
else
    echo -e "\n${GREEN}All tests passed! 🎉${NC}"
    exit 0
fi
