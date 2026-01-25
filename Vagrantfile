Vagrant.configure("2") do |config|
  
  # VM 1 - App server
  config.vm.define "app" do |app|
    app.vm.box = "ubuntu/jammy64"    # Ubuntu 22.04
    app.vm.hostname = "app"
    # change your ips and ports
    app.vm.network "private_network", ip: "192.168.xx.xxx"
    app.vm.network "forwarded_port", guest: xxxx, host: xxxx 
    app.vm.network "forwarded_port", guest: xxxx, host: xxxx
    app.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end
  end

  # VM 2 - Jenkins server
  config.vm.define "jenkins" do |jenkins|
    jenkins.vm.box = "ubuntu/jammy64"
    jenkins.vm.hostname = "jenkins"
    # change your ips and ports
    jenkins.vm.network "private_network", ip: "192.168.xx.xxx"
    jenkins.vm.network "forwarded_port", guest: xxxx, host: xxxx
    jenkins.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end
  end

  # VM 3.1 - K8s master1
  config.vm.define "k8s-master1" do |m1|
    m1.vm.box = "ubuntu/jammy64"
    m1.vm.hostname = "k8s-master1"
    # change your ips and ports
    m1.vm.network "private_network", ip: "192.168.xx.xxx"
    m1.vm.network "forwarded_port", guest: xxxx, host: xxxx
    m1.vm.provider "virtualbox" do |vb|
      vb.memory = 4096
      vb.cpus = 3
    end
  end

  # VM 4 - K8s worker
  config.vm.define "k8s-worker" do |w|
    w.vm.box = "ubuntu/jammy64"
    w.vm.hostname = "k8s-worker"
    # change your ips and ports
    w.vm.network "private_network", ip: "192.168.xx.xxx"
    w.vm.provider "virtualbox" do |vb|
      vb.memory = 4096
      vb.cpus = 2
    end
  end

  # VM 5 - Monitoring
  config.vm.define "monitoring" do |mn|
    mn.vm.box = "ubuntu/jammy64"
    mn.vm.hostname = "monitoring"
    # change your ips and ports
    mn.vm.network "private_network", ip: "192.168.xx.xxx"
    mn.vm.network "forwarded_port", guest: xxxx, host: xxxx
    mn.vm.network "forwarded_port", guest: xxxx, host: xxxx
    mn.vm.network "forwarded_port", guest: xxxx, host: xxxx
    mn.vm.provider "virtualbox" do |vb|
      vb.memory = 4096
      vb.cpus = 2
    end
  end

end
