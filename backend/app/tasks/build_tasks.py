def enqueue_build_task(job: dict, runner) -> dict:
    return runner.run(
        job_id=job["id"],
        kb_id=job["kb_id"],
        sources=job.get("sources", []),
    )
