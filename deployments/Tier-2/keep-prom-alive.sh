while true; do
  kubectl port-forward --address 0.0.0.0 service/prometheus-kube-prometheus-prometheus 9090 > /dev/null 2>&1
  sleep 5
done
