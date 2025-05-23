# init-ipfs.sh
#!/bin/sh
ipfs init --profile server
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json Swarm.Transports.Network.QUIC false
ipfs config --json Swarm.Transports.Network.TCP true
ipfs config --json Swarm.Transports.Network.Websocket true