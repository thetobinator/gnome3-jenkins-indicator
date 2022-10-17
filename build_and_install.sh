./build.sh
EXT_DIR=~/.local/share/gnome-shell/extensions/jenkins-indicator@philipphoffmann.de
rm -f -r $EXT_DIR
mkdir -p $EXT_DIR
cp gnome3-jenkins.zip $EXT_DIR
cd $EXT_DIR && unzip gnome3-jenkins.zip
echo "Now press ALT-F2 and enter "R" in the prompt to restart the gnome shell"
