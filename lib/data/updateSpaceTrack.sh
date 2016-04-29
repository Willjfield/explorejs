while [ 1 ];do

wget  --post-data='identity='$1'&password='$2 --cookies=on --keep-session-cookies --save-cookies=cookies.txt 'https://www.space-track.org/ajaxauth/login' -olog

wget --limit-rate=100K --keep-session-cookies --load-cookies=cookies.txt $3 -O $4

sleep 86400; done
