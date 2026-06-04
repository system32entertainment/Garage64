"""Regenerate all .jem, .jpm, and .properties files from the database."""

from django.core.management.base import BaseCommand, CommandError

from pack.services.exporter import export_all


class Command(BaseCommand):
    help = 'Write pack files from the database to PACK_ROOT'

    def handle(self, *args, **options):
        result = export_all()

        for path in result.written:
            self.stdout.write(f'  Wrote {path}')

        if result.errors:
            for error in result.errors:
                self.stderr.write(error)
            raise CommandError('Export failed.')

        self.stdout.write(self.style.SUCCESS('Export complete.'))
