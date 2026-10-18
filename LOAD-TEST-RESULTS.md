# Baseline Load Test Results: Matinee API (`/api/movies`)

## 1. Test Purpose and Scope

This document records the results of an initial baseline load test conducted against the Matinee API endpoint (`/api/movies`). 

* **Type**: Baseline test (not a stress test or capacity benchmark).
* **Scope**: Evaluates the basic responsiveness and status code distribution of the movie listing endpoint under minimal synthetic traffic (2 concurrent connections, 20 total requests).
* **Objective**: Establish an initial observational data point for endpoint latency and throughput.
* **Context**: All 20 requests returned HTTP 200 responses, demonstrating that the endpoint responded successfully during this test run. However, this small baseline run does not establish production capacity, concurrency thresholds, or a performance guarantee. Latency variability was observed across requests, which may stem from several factors (e.g., cold starts, database query execution, network transit) and was not investigated as part of this test.

---

## 2. Environment and Command Used

### Target Environment
* **Endpoint**: `https://matinee-two.vercel.app/api/movies`
* **HTTP Method**: `GET`
* **Host Platform**: Vercel Serverless Deployment

### Execution Details
* **Tool**: `autocannon` executed via `npx`
* **Command Executed**:
  ```bash
  npx --yes autocannon --connections 2 --amount 20 --renderStatusCodes https://matinee-two.vercel.app/api/movies
  ```
* **Configured Connections**: 2
* **Total Configured Requests**: 20
* **Test Duration**: 13.1 seconds
* **Sampling**: Request and byte counts sampled once per second (# of samples: 13)

---

## 3. Results Table

The following measurements were recorded directly from the baseline run output:

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **HTTP 200 Responses** | 20 | All recorded responses returned 200 OK |
| **Other HTTP Status Codes** | 0 | No 4xx/5xx status codes recorded |
| **Average Latency** | 1,168.5 ms | Mean response time |
| **Median Latency (p50)** | 786 ms | 50% of requests resolved within 786 ms |
| **p97.5 Latency** | 2,217 ms | Reported percentile by autocannon |
| **p99 Latency** | 2,217 ms | Reported percentile by autocannon |
| **Maximum Latency** | 2,217 ms | Longest response time |
| **Latency Std Deviation** | 641.68 ms | Reflects variance between fastest and slowest responses |
| **Average Throughput** | 1.54 req/sec | Calculated over the 13.1s duration |
| **Total Data Received** | 83.5 kB | Aggregate payload bytes read |
| **Total Requests Completed** | 20 | In 13.1 seconds |

---

## 4. Interpretation and Limitations

1. **Baseline Nature vs. Stress Testing**:
   With only 2 concurrent connections and a total of 20 requests, this test does not apply stress or saturation to the application infrastructure. It serves solely as a reference point for single/dual-user latency behavior.
2. **Availability vs. Production Guarantee**:
   While 100% of the requests (20/20) succeeded with status code 200, this confirms endpoint availability during the narrow 13.1-second test window only. It provides no guarantees regarding behavior under sustained, concurrent, or bursty production traffic.
3. **Latency Variability**:
   The response latency varied between a median of 786 ms and a maximum of 2,217 ms (standard deviation of 641.68 ms). Potential causes include serverless function cold starts, database query execution times, edge routing, and general Internet transit latency. Detailed profiling or distributed tracing was not performed during this baseline test.
4. **Percentile Reporting Note**:
   Autocannon natively reported `p97.5` and `p99` latency figures (both at 2,217 ms) rather than `p95`.
5. **Absence of Separate Timeout / Failure Tracking**:
   The captured console output from autocannon does not report a separate failed-request or timeout counter. Because unhandled timeouts cannot be independently verified from the captured output, zero timeouts cannot be formally claimed, although all 20 issued requests correspond to the 20 HTTP 200 responses received.

---

## 5. Conclusion and Recommendations

The `/api/movies` endpoint successfully served all 20 requests during this baseline execution with an average latency of 1,168.5 ms and median of 786 ms. 

Further testing (such as ramp-up tests, sustained load testing, or stress tests) should only be conducted if appropriate and safe:
* Verify that target environments and third-party dependencies (such as managed databases or external APIs) have adequate capacity and safeguards before applying higher loads.
* Coordinate any load testing against production deployments to prevent unintended disruptions, quota exhaustion, or unbudgeted cloud infrastructure expenses.
