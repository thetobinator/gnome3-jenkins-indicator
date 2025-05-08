sudo ./build.sh
EXT_DIR=~/.local/share/gnome-shell/extensions/jenkins-indicator@philipphoffmann.de
sudo rm -f -r $EXT_DIR
sudo mkdir -p $EXT_DIR
sudo cp gnome3-jenkins.zip $EXT_DIR
cd $EXT_DIR && sudo unzip gnome3-jenkins.zip
echo "Now press ALT-F2 and enter "restart" in the prompt to restart the gnome shell"
