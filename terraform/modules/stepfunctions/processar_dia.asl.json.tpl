{
  "Comment": "processar_dia(dt): carregar_origem_dia -> enriquecer_dia (brownfield notebook)",
  "StartAt": "CarregarOrigem",
  "States": {
    "CarregarOrigem": {
      "Type": "Task",
      "Resource": "arn:aws:states:::glue:startJobRun.sync",
      "Parameters": {
        "JobName": "${origem_job_name}",
        "Arguments": {
          "--dt.$": "$.dt"
        }
      },
      "ResultPath": "$.glueOrigem",
      "Retry": [
        {
          "ErrorEquals": [
            "States.TaskFailed",
            "Glue.JobRunFailed"
          ],
          "IntervalSeconds": 30,
          "MaxAttempts": 2,
          "BackoffRate": 2
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.error",
          "Next": "FalhaProcessamento"
        }
      ],
      "Next": "EnriquecerDia"
    },
    "EnriquecerDia": {
      "Type": "Task",
      "Resource": "arn:aws:states:::glue:startJobRun.sync",
      "Parameters": {
        "JobName": "${enriquecer_job_name}",
        "Arguments": {
          "--dt.$": "$.dt"
        }
      },
      "ResultPath": "$.glueEnriquecido",
      "Retry": [
        {
          "ErrorEquals": [
            "States.TaskFailed",
            "Glue.JobRunFailed"
          ],
          "IntervalSeconds": 30,
          "MaxAttempts": 2,
          "BackoffRate": 2
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.error",
          "Next": "FalhaProcessamento"
        }
      ],
      "Next": "Sucesso"
    },
    "Sucesso": {
      "Type": "Pass",
      "Parameters": {
        "dt.$": "$.dt",
        "status": "SUCCEEDED",
        "origem_job.$": "$.glueOrigem.JobName",
        "enriquecido_job.$": "$.glueEnriquecido.JobName",
        "message": "processar_dia concluido (origem + enriquecido)"
      },
      "End": true
    },
    "FalhaProcessamento": {
      "Type": "Fail",
      "Error": "ProcessarDiaFailed",
      "Cause": "Falha em carregar_origem_dia ou enriquecer_dia — ver logs Glue e Step Functions"
    }
  }
}
