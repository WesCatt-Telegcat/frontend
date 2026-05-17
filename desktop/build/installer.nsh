!macro customInstall
  SetShellVarContext current
  CreateDirectory "$APPDATA\Telecat"
  StrCpy $0 "en"
  StrCmp $LANGUAGE 2052 0 +2
  StrCpy $0 "zh"
  StrCmp $LANGUAGE 1033 0 +2
  StrCpy $0 "en"
  FileOpen $1 "$APPDATA\Telecat\installer-locale.json" w
  FileWrite $1 "{\"locale\":\"$0\"}"
  FileClose $1
!macroend
